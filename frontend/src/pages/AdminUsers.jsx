import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";

// Placeholder for the user management page (list and form come in step 1.7)
const AdminUsers = () => {
  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-8 text-slate-800 md:px-8 dark:bg-[#0f172a] dark:text-slate-200">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          <ArrowLeft size={16} />
          <span>Về Bản đồ</span>
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <Users size={28} className="text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-[#1e293b] dark:text-slate-400">
          Danh sách và biểu mẫu người dùng sẽ được làm ở bước tiếp theo.
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
