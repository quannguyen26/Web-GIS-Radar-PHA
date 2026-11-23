import React from "react";
import { Link } from "react-router-dom";
import { Map, ShieldX } from "lucide-react";
import LogoImg from "../assets/LogoImg.png";

// Shown when a logged-in user opens a page their role may not access
const Forbidden = () => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-12 transition-colors dark:bg-[#0f172a]">
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xl transition-all dark:border-slate-800 dark:bg-[#1e293b]">
          <img
            src={LogoImg}
            alt="Logo"
            className="mx-auto mb-4 h-26 w-26 object-contain drop-shadow"
          />

          <div className="flex items-center justify-center gap-3">
            <h1 className="bg-linear-to-r from-rose-600 to-orange-500 bg-clip-text text-7xl font-black tracking-tight text-transparent">
              403
            </h1>
            <ShieldX
              size={40}
              className="text-rose-500 dark:text-rose-400"
              aria-hidden="true"
            />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-800 dark:text-slate-100">
            Không có quyền truy cập
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Tài khoản của bạn không được phép xem trang này.
          </p>

          <Link
            to="/"
            className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-700 active:scale-98 dark:shadow-none"
          >
            <Map size={18} />
            <span>Về Bản đồ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
