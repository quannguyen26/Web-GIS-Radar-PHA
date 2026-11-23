import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  LockOpen,
  Pencil,
  UserPlus,
  Users,
} from "lucide-react";
import api from "../lib/api";
import UserFormDialog from "../components/admin/UserFormDialog";
import ResetPasswordDialog from "../components/admin/ResetPasswordDialog";
import { useAuth } from "../context/AuthContext";

// "2026-11-23T08:05:00Z" → "23/11/2026 15:05" (browser time zone)
const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Chưa đăng nhập";

// Mirror of canManageUser() in the backend userController, used only to hide
// buttons the backend would refuse anyway (the backend still decides).
const canManage = (actor, target) => {
  if (!actor || target.roleCode === "SYSTEM_ADMIN") return false;
  if (String(actor.id) === String(target.id)) return false; // never yourself
  if (actor.roleCode === "SYSTEM_ADMIN") return true;
  if (actor.roleCode === "ADMIN") {
    return (
      target.roleCode === "USER" &&
      String(target.organizationId) === String(actor.organizationId)
    );
  }
  return false;
};

// User management page (step 1.7): list, then lock/unlock and add/edit forms
const AdminUsers = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  // Id of the row whose lock/unlock request is running (disables its button)
  const [busyUserId, setBusyUserId] = useState(null);
  // Result of the last action: { type: "success" | "error", text }
  const [notice, setNotice] = useState(null);
  // Which dialog is open: null, { type: "create" },
  // { type: "edit", user } or { type: "password", user }
  const [dialog, setDialog] = useState(null);
  // Bump this number to fetch the list again (the effect depends on it)
  const [reloadKey, setReloadKey] = useState(0);

  const openDialog = (next) => {
    setNotice(null);
    setDialog(next);
  };

  // Called by a dialog after a successful save
  const handleSaved = (message) => {
    setDialog(null);
    setNotice({ type: "success", text: message });
    setReloadKey((k) => k + 1);
  };

  // Lock (active=false) or unlock (active=true) one account
  const handleToggleActive = async (target) => {
    const nextActive = !target.active;
    const question = nextActive
      ? `Mở khóa tài khoản "${target.username}"?`
      : `Khóa tài khoản "${target.username}"? Người này sẽ bị đăng xuất ngay.`;
    if (!window.confirm(question)) return;

    setBusyUserId(target.id);
    setNotice(null);
    try {
      const res = await api.patch(`/users/${target.id}/active`, {
        active: nextActive,
      });
      const updated = res.data?.user;
      // Replace only the changed row, keep the rest of the list as is
      if (updated) {
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? updated : u)),
        );
      }
      setNotice({ type: "success", text: res.data?.message || "Đã cập nhật" });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.response?.data?.message || "Không cập nhật được tài khoản.",
      });
    } finally {
      setBusyUserId(null);
    }
  };

  // Load the user list when the page opens and whenever reloadKey changes.
  // The backend decides the scope: SYSTEM_ADMIN gets everyone, ADMIN only
  // their own organization.
  useEffect(() => {
    let isCancelled = false;

    const loadUsers = async () => {
      try {
        const res = await api.get("/users");
        if (!isCancelled) {
          setUsers(res.data?.users || []);
          setErrorMsg("");
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMsg(
            error.response?.data?.message ||
              "Không tải được danh sách người dùng.",
          );
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    loadUsers();

    // Ignore a late response if the user already left the page
    return () => {
      isCancelled = true;
    };
  }, [reloadKey]);

  const scopeLabel =
    currentUser?.roleCode === "SYSTEM_ADMIN"
      ? "Tất cả đơn vị"
      : currentUser?.organizationName || "";

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-8 text-slate-800 md:px-8 dark:bg-[#0f172a] dark:text-slate-200">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          <ArrowLeft size={16} />
          <span>Về Bản đồ</span>
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Users size={28} className="text-indigo-600 dark:text-indigo-400" />
            <div>
              <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
              {scopeLabel && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {scopeLabel}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => openDialog({ type: "create" })}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-700 dark:shadow-none"
          >
            <UserPlus size={18} />
            <span>Thêm người dùng</span>
          </button>
        </div>

        {/* Result of the last action (add, lock, unlock) */}
        {notice && (
          <div
            role="status"
            className={`mt-6 flex items-start gap-3 rounded-xl border p-3 text-sm ${
              notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400"
            }`}
          >
            {notice.type === "success" ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#1e293b]">
          {isLoading ? (
            // Loading state
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              <span>Đang tải danh sách...</span>
            </div>
          ) : errorMsg ? (
            // Error state
            <div className="flex items-start gap-3 p-6 text-sm text-rose-700 dark:text-rose-400">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : users.length === 0 ? (
            // Empty state
            <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Chưa có người dùng nào.
            </div>
          ) : (
            // Data: cells stay on one line, the table scrolls sideways on
            // narrow screens instead of squeezing the text
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase dark:bg-slate-900/50 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Họ tên</th>
                    <th className="px-4 py-3 font-semibold">Tên đăng nhập</th>
                    <th className="px-4 py-3 font-semibold">Chức danh</th>
                    <th className="px-4 py-3 font-semibold">Vai trò</th>
                    <th className="px-4 py-3 font-semibold">Đơn vị</th>
                    <th className="px-4 py-3 font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 font-semibold">
                      Đăng nhập gần nhất
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3 font-medium">{u.fullName}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {u.username}
                      </td>
                      <td className="px-4 py-3">{u.titleName || "—"}</td>
                      <td className="px-4 py-3">{u.roleName || u.roleCode}</td>
                      <td className="px-4 py-3">{u.organizationName || "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            u.active
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                          }`}
                        >
                          {u.active ? "Hoạt động" : "Đã khóa"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {formatDateTime(u.lastLogin)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canManage(currentUser, u) && (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                openDialog({ type: "edit", user: u })
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                            >
                              <Pencil size={14} />
                              <span>Sửa</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                openDialog({ type: "password", user: u })
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              <KeyRound size={14} />
                              <span>Đặt lại MK</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(u)}
                              disabled={busyUserId === u.id}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                u.active
                                  ? "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                                  : "text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                              }`}
                            >
                              {busyUserId === u.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : u.active ? (
                                <Lock size={14} />
                              ) : (
                                <LockOpen size={14} />
                              )}
                              <span>{u.active ? "Khóa" : "Mở khóa"}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs are mounted only while open, so each one starts fresh.
          key={user.id} gives a new form when switching to another user. */}
      {(dialog?.type === "create" || dialog?.type === "edit") && (
        <UserFormDialog
          key={dialog.user?.id ?? "new"}
          user={dialog.user}
          onClose={() => setDialog(null)}
          onSaved={handleSaved}
        />
      )}
      {dialog?.type === "password" && (
        <ResetPasswordDialog
          user={dialog.user}
          onClose={() => setDialog(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default AdminUsers;
