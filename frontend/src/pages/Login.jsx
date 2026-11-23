import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  LogIn,
  AlertCircle,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LogoImg from "../assets/LogoImg.png";

// Rendered as a nested route of "/" (see App.jsx), so the dashboard stays
// mounted behind this modal and is not reloaded after login.

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Page that sent the user here (set by ProtectedRoute), default: the map
  const redirectTo = location.state?.from?.pathname || "/";
  const dialogRef = useRef(null);
  // True while our own cleanup is closing the dialog (not the user)
  const isUnmountingRef = useRef(false);

  // Open the dialog as a modal on mount, close it on unmount
  useEffect(() => {
    const dialog = dialogRef.current;
    isUnmountingRef.current = false;
    if (!dialog.open) dialog.showModal();
    return () => {
      isUnmountingRef.current = true;
      dialog.close();
    };
  }, []);

  // Closing the modal = going back to the map route
  const closeModal = () => navigate("/");

  // Esc key: let the router close the dialog instead of the browser
  const handleCancel = (e) => {
    e.preventDefault();
    closeModal();
  };

  // The browser may close the dialog by itself, skipping onCancel (e.g. Esc
  // before any click on the page). Sync the URL in that case. Skip when our
  // cleanup closed it, or when StrictMode already reopened it.
  const handleClose = () => {
    if (isUnmountingRef.current || dialogRef.current?.open) return;
    closeModal();
  };

  // Redirect once authenticated (already logged in, or right after login)
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim() || !password) {
      setErrorMsg("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setIsSubmitting(true);
    const result = await login(username.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(redirectTo, { replace: true });
    } else {
      setErrorMsg(result.message || "Đăng nhập thất bại.");
    }
  };

  return (
    // Native modal dialog: rendered in the browser's top layer (above
    // Leaflet panes), makes the dashboard behind it inert, closes on Esc.
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClose={handleClose}
      aria-labelledby="login-title"
      className="w-full max-w-md max-h-full p-4 m-auto overflow-y-auto bg-transparent backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm"
    >
      <div>
        <div>
          {/* Login Card */}
          <div className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-xl transition-all dark:border-slate-800 dark:bg-[#1e293b]">
            {/* Close button */}
            {/* <button
              type="button"
              onClick={closeModal}
              aria-label="Đóng"
              className="absolute top-3 right-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X size={18} />
            </button> */}

            {/* Header & Logo */}
            <div className="flex flex-col items-center mb-6 text-center">
              <div className="relative flex items-center justify-center mb-2">
                <img
                  src={LogoImg}
                  alt="Logo"
                  className="object-contain w-20 h-20 drop-shadow"
                />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-transparent bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text">
                HỆ THỐNG RA ĐA PHA ĐIN
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Đăng nhập để truy cập đầy đủ tính năng
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-start gap-3 p-3 mb-5 text-sm border rounded-xl border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                  Tên đăng nhập
                </label>
                <div className="relative flex items-center">
                  <User
                    size={18}
                    className="absolute left-3.5 text-slate-400 dark:text-slate-500"
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập"
                    autoComplete="username"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm text-gray-900 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-900"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-300">
                  Mật khẩu
                </label>
                <div className="relative flex items-center">
                  <Lock
                    size={18}
                    className="absolute left-3.5 text-slate-400 dark:text-slate-500"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-11 pl-10 text-sm text-gray-900 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-900"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-700 active:scale-98 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" />
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Đăng nhập</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
              <span className="text-xs text-slate-400 dark:text-slate-500">
                hoặc
              </span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
            </div>

            {/* Navigation back to GIS map (secondary action) */}
            <Link
              to="/"
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-transparent dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
            >
              <ArrowLeft
                size={18}
                className="transition-transform group-hover:-translate-x-1"
              />
              <span>Quay lại Bản đồ</span>
            </Link>
          </div>

          {/* Footer info */}
          <p className="mt-4 text-xs text-center text-white/80 drop-shadow">
            Cổng thông tin điện tử Trạm Ra đa thời tiết Pha Đin
          </p>
        </div>
      </div>
    </dialog>
  );
};

export default Login;
