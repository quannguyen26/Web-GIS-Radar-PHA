import React, { useEffect, useState } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { createPortal } from "react-dom";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

// Same rules as validateSignUpInput() in the backend authController.
// Checking here gives instant feedback; the backend checks again anyway.
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,50}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

const EMPTY_FORM = {
  username: "",
  password: "",
  fullname: "",
  email: "",
  phone: "",
  title: "",
  role: "",
  organization: "",
};

// Titles that fit the chosen organization: a title whose organizationType is
// null fits every type (same rule as the backend, sql/002)
const titlesForOrganization = (lookups, organizationId) => {
  const organization = lookups?.organizations.find(
    (o) => String(o.id) === String(organizationId),
  );
  if (!organization) return [];
  return lookups.titles.filter(
    (t) =>
      !t.organizationType ||
      t.organizationType === organization.organizationType,
  );
};

// Keep the current title if it still fits, otherwise pick the only choice
// (radar station → Quan trắc viên, provincial station → Dự báo viên)
const pickTitle = (titles, currentTitle) => {
  if (titles.some((t) => String(t.id) === currentTitle)) return currentTitle;
  return titles.length === 1 ? String(titles[0].id) : "";
};

// Fill the form from an existing user (edit mode). Select values are strings.
const formFromUser = (user) => ({
  ...EMPTY_FORM,
  username: user.username,
  fullname: user.fullName || "",
  email: user.email || "",
  phone: user.phone || "",
  title: user.titleId ? String(user.titleId) : "",
  role: user.roleId ? String(user.roleId) : "",
  organization: user.organizationId ? String(user.organizationId) : "",
});

// Return a Vietnamese error message, or "" when the form is valid.
// Username and password are checked only when creating.
const validate = (form, isEdit) => {
  if (!isEdit && !USERNAME_PATTERN.test(form.username)) {
    return "Tên đăng nhập dài 3–50 ký tự, chỉ gồm chữ không dấu, số và . _ -";
  }
  if (
    !isEdit &&
    (form.password.length < MIN_PASSWORD_LENGTH ||
      form.password.length > MAX_PASSWORD_LENGTH)
  ) {
    return `Mật khẩu dài từ ${MIN_PASSWORD_LENGTH} đến ${MAX_PASSWORD_LENGTH} ký tự.`;
  }
  if (!form.fullname.trim()) return "Vui lòng nhập họ tên.";
  if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) {
    return "Email không hợp lệ.";
  }
  if (form.phone.trim().length > 20) return "Số điện thoại tối đa 20 ký tự.";
  if (!form.title || !form.role || !form.organization) {
    return "Vui lòng chọn chức danh, vai trò và đơn vị.";
  }
  return "";
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-900";
const labelClass =
  "mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300";

// Modal form to create a user (POST /api/auth/signup) or, when `user` is
// given, edit that user (PATCH /api/users/:id).
// Rendered only while open: the parent mounts it, onClose unmounts it.
const UserFormDialog = ({ user = null, onClose, onSaved }) => {
  const { user: currentUser } = useAuth();
  const isEdit = Boolean(user);
  // Backend rule: only SYSTEM_ADMIN may change role or organization
  const canChangeRoleAndOrg = currentUser?.roleCode === "SYSTEM_ADMIN";

  // Controlled form: every input shows form[name] and writes back on change.
  // The initializer function runs only on the first render.
  const [form, setForm] = useState(() =>
    isEdit ? formFromUser(user) : EMPTY_FORM,
  );
  const [lookups, setLookups] = useState(null); // { roles, titles, organizations }
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load dropdown options once; the backend already limits them by role
  useEffect(() => {
    let isCancelled = false;

    const loadLookups = async () => {
      try {
        const res = await api.get("/lookups");
        if (isCancelled) return;
        const data = res.data;
        setLookups(data);
        // Preselect when there is only one choice (e.g. ADMIN: role USER,
        // own organization, and then the title of that organization type)
        setForm((prev) => {
          const organization =
            data.organizations.length === 1
              ? String(data.organizations[0].id)
              : prev.organization;
          return {
            ...prev,
            role:
              data.roles.length === 1 ? String(data.roles[0].id) : prev.role,
            organization,
            title: pickTitle(
              titlesForOrganization(data, organization),
              prev.title,
            ),
          };
        });
      } catch (error) {
        if (!isCancelled) {
          setErrorMsg(
            error.response?.data?.message || "Không tải được danh mục.",
          );
        }
      }
    };

    loadLookups();
    return () => {
      isCancelled = true;
    };
  }, []);

  // One handler for every field, thanks to the input's name attribute
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // A new organization may change which titles are allowed
      if (name === "organization") {
        next.title = pickTitle(
          titlesForOrganization(lookups, value),
          prev.title,
        );
      }
      return next;
    });
  };

  // Title choices depend on the selected organization
  const titleOptions = titlesForOrganization(lookups, form.organization);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate(form, isEdit);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    // Fields every admin may set (same names as the backend expects)
    const body = {
      fullname: form.fullname.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      title: Number(form.title),
    };
    // Sending role/organization as ADMIN makes PATCH answer 403, so add them
    // only when creating or when the caller is SYSTEM_ADMIN
    if (!isEdit || canChangeRoleAndOrg) {
      body.role = Number(form.role);
      body.organization = Number(form.organization);
    }

    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const res = isEdit
        ? await api.patch(`/users/${user.id}`, body)
        : await api.post("/auth/signup", {
            ...body,
            username: form.username,
            password: form.password,
          });
      onSaved(
        res.data?.message ||
          (isEdit ? "Đã cập nhật người dùng" : "Đã thêm người dùng"),
      );
    } catch (error) {
      // e.g. 409 "username đã tồn tại", 403 not allowed
      setErrorMsg(
        error.response?.data?.message || "Không lưu được người dùng.",
      );
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || !lookups;

  // Rendered into <body> (portal): the admin page sits inside the map area,
  // whose stacking context would otherwise keep the overlay below the
  // header and sidebar.
  return createPortal(
    <div
      className="fixed inset-0 z-1200 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-form-title"
    >
      <div className="relative max-h-full w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-[#1e293b]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-3 right-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <X size={18} />
        </button>

        <h2
          id="user-form-title"
          className="mb-5 text-lg font-bold text-slate-800 dark:text-slate-100"
        >
          {isEdit ? `Sửa người dùng: ${user.username}` : "Thêm người dùng"}
        </h2>

        {errorMsg && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {/* Username can never change; password has its own reset button */}
          <div className={isEdit ? "sm:col-span-2" : ""}>
            <label htmlFor="uf-username" className={labelClass}>
              Tên đăng nhập {isEdit ? "(không đổi được)" : "*"}
            </label>
            <input
              id="uf-username"
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="off"
              autoFocus={!isEdit}
              disabled={isDisabled || isEdit}
              className={inputClass}
            />
          </div>

          {!isEdit && (
            <div>
              <label htmlFor="uf-password" className={labelClass}>
                Mật khẩu *
              </label>
              <input
                id="uf-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={isDisabled}
                className={inputClass}
              />
            </div>
          )}

          <div className="sm:col-span-2">
            <label htmlFor="uf-fullname" className={labelClass}>
              Họ tên *
            </label>
            <input
              id="uf-fullname"
              name="fullname"
              value={form.fullname}
              onChange={handleChange}
              disabled={isDisabled}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="uf-email" className={labelClass}>
              Email
            </label>
            <input
              id="uf-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={isDisabled}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="uf-phone" className={labelClass}>
              Số điện thoại
            </label>
            <input
              id="uf-phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              disabled={isDisabled}
              className={inputClass}
            />
          </div>

          {/* Organization first: it decides which titles are allowed */}
          <div className="sm:col-span-2">
            <label htmlFor="uf-organization" className={labelClass}>
              Đơn vị *
            </label>
            <select
              id="uf-organization"
              name="organization"
              value={form.organization}
              onChange={handleChange}
              disabled={isDisabled || (isEdit && !canChangeRoleAndOrg)}
              className={inputClass}
            >
              <option value="">-- Chọn --</option>
              {lookups?.organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="uf-title" className={labelClass}>
              Chức danh *
            </label>
            <select
              id="uf-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              disabled={isDisabled || !form.organization}
              className={inputClass}
            >
              <option value="">
                {form.organization ? "-- Chọn --" : "-- Chọn đơn vị trước --"}
              </option>
              {titleOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="uf-role" className={labelClass}>
              Vai trò *
            </label>
            <select
              id="uf-role"
              name="role"
              value={form.role}
              onChange={handleChange}
              disabled={isDisabled || (isEdit && !canChangeRoleAndOrg)}
              className={inputClass}
            >
              <option value="">-- Chọn --</option>
              {lookups?.roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isDisabled}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{isEdit ? "Lưu" : "Thêm"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default UserFormDialog;
