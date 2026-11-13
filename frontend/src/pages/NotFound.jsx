import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Map, SearchX } from "lucide-react";
import LogoImg from "../assets/LogoImg.png";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-12 transition-colors dark:bg-[#0f172a]">
      {/* Background decoration elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-600/10" />
        <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/10" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xl transition-all dark:border-slate-800 dark:bg-[#1e293b]">
          <img
            src={LogoImg}
            alt="Logo"
            className="mx-auto mb-4 h-26 w-26 object-contain drop-shadow"
          />

          {/* Error code */}
          <div className="flex items-center justify-center gap-3">
            <h1 className="bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-7xl font-black tracking-tight text-transparent">
              404
            </h1>
            <SearchX
              size={40}
              className="text-indigo-500 dark:text-indigo-400"
              aria-hidden="true"
            />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-800 dark:text-slate-100">
            Không tìm thấy trang
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Đường dẫn bạn truy cập không tồn tại hoặc đã được di chuyển.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-700 active:scale-98 dark:shadow-none"
            >
              <Map size={18} />
              <span>Về Bản đồ</span>
            </Link>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-gray-50 active:scale-98 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              <ArrowLeft size={18} />
              <span>Quay lại</span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Cổng thông tin Trạm Ra đa thời tiết Pha Đin
        </p>
      </div>
    </div>
  );
};

export default NotFound;
