import React from "react";
import { Menu, Search, Sun, Bell, Moon } from "lucide-react";
import Button from "./ui/Button";
const Header = ({
  isSidebarOpen,
  setIsSidebarOpen,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isDarkMode,
  setIsDarkMode,
}) => {
  return (
    <header className="z-30 flex h-17 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 transition-colors md:px-6 dark:border-slate-800 dark:bg-[#4a5361] dark:backdrop-blur-md">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <Button
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-400/10 md:hidden"
          onClick={() => {
            setIsMobileMenuOpen(true);
          }}
        >
          <Menu size={22} />
        </Button>

        <Button
          className="hidden rounded-xl p-2.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-indigo-500 md:block dark:text-slate-400 dark:hover:bg-slate-800"
          onClick={() => {
            setIsSidebarOpen(!isSidebarOpen);
          }}
        >
          <Menu size={22} />
        </Button>

        <div className="relative hidden w-64 items-center sm:flex md:w-80">
          <Search
            className="absolute left-3 cursor-pointer text-slate-500"
            size={16}
          />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full rounded-xl border border-transparent bg-gray-100 py-2 pr-4 pl-10 text-sm transition-all outline-none focus:border-gray-200 focus:bg-white dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-slate-700 dark:focus:bg-slate-800"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        <Button
          className="rounded-xl border border-gray-200 bg-gray-100 p-2.5 text-slate-600 transition-all hover:bg-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-400 dark:hover:bg-slate-700"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        <Button className="relative rounded-xl p-2.5 text-gray-400 transition-all hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full border-2 border-[#1e293b] bg-indigo-500 dark:border-slate-900"></span>
        </Button>

        <div className="mx-1 h-8 w-px bg-gray-200 dark:bg-slate-800"></div>

        <Button className="rounded-lg bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-600">
          Đăng nhập
        </Button>
      </div>
    </header>
  );
};

export default Header;
