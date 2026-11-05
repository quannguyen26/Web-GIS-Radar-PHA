import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  LogIn,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LogoImg from "../assets/LogoImg.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
      navigate("/", { replace: true });
    } else {
      setErrorMsg(result.message || "Đăng nhập thất bại.");
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-12 transition-colors dark:bg-[#0f172a]">
      {/* Background decoration elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-600/10" />
        <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/10" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Navigation back to GIS map */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            <ArrowLeft size={18} />
            <span>Quay lại Bản đồ</span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl transition-all dark:border-slate-800 dark:bg-[#1e293b]">
          {/* Header & Logo */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-3 flex items-center justify-center">
              <img
                src={LogoImg}
                alt="Logo"
                className="h-20 w-20 object-contain drop-shadow"
              />
            </div>
            <h1 className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-black tracking-tight text-transparent">
              HỆ THỐNG RA ĐA PHA ĐIN
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Đăng nhập để truy cập đầy đủ tính năng Web-GIS
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-700 active:scale-98 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-none"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Cổng thông tin Trạm Ra đa thời tiết Pha Đin
        </p>
      </div>
    </div>
  );
};

export default Login;
