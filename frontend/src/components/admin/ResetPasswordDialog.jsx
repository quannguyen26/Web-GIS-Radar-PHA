import React, { useState } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { createPortal } from "react-dom";
import api from "../../lib/api";

// Same limits as resetUserPassword() in the backend userController
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-900";
const labelClass =
  "mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300";

// Modal to set a new password for `user` (PUT /api/users/:id/password).
// The backend also logs that user out everywhere.
const ResetPasswordDialog = ({ user, onClose, onSaved }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      password.length < MIN_PASSWORD_LENGTH ||
      password.length > MAX_PASSWORD_LENGTH
    ) {
      setErrorMsg(
        `Mật khẩu dài từ ${MIN_PASSWORD_LENGTH} đến ${MAX_PASSWORD_LENGTH} ký tự.`,
      );
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Hai mật khẩu không khớp.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);
    try {
      const res = await api.put(`/users/${user.id}/password`, { password });
      onSaved(res.data?.message || "Đã đặt lại mật khẩu");
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Không đặt lại được mật khẩu.",
      );
      setIsSubmitting(false);
    }
  };

  // Rendered into <body> (portal): the admin page sits inside the map area,
  // whose stacking context would otherwise keep the overlay below the
  // header and sidebar.
  return createPortal(
    <div
      className="fixed inset-0 z-1200 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-password-title"
    >
      <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-[#1e293b]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-3 right-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <X size={18} />
        </button>

        <h2
          id="reset-password-title"
          className="text-lg font-bold text-slate-800 dark:text-slate-100"
        >
          Đặt lại mật khẩu
        </h2>
        <p className="mt-1 mb-5 text-sm text-slate-500 dark:text-slate-400">
          Tài khoản <strong>{user.username}</strong> sẽ bị đăng xuất khỏi mọi
          thiết bị.
        </p>

        {errorMsg && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="rp-password" className={labelClass}>
              Mật khẩu mới
            </label>
            <input
              id="rp-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              autoFocus
              disabled={isSubmitting}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="rp-confirm" className={labelClass}>
              Nhập lại mật khẩu mới
            </label>
            <input
              id="rp-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={isSubmitting}
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>Đặt lại</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default ResetPasswordDialog;
