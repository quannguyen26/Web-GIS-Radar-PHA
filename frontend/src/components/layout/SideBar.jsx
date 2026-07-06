import React from "react";
import { LogOut } from "lucide-react";
import Navigation from "../ui/Navigation";
import Logo from "../ui/Logo";

const SideBar = ({ isSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="animate-in fade-in fixed inset-0 z-45 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`z-50 flex flex-col border-r border-gray-200 bg-white shadow-xl transition-all duration-500 ease-in-out dark:border-slate-800 dark:bg-[#1e293b] ${isSidebarOpen ? "w-64" : "w-21"} ${isMobileMenuOpen ? "fixed inset-y-0 left-0 w-64 translate-x-0 shadow-2xl" : "relative hidden translate-x-0 md:flex"} `}
      >
        {/* Logo */}
        <Logo
          isSidebarOpen={isSidebarOpen}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        {/* Navigation */}
        <Navigation
          isSidebarOpen={isSidebarOpen}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <div className="border-t border-gray-100 bg-white p-4 dark:border-slate-800 dark:bg-[#1e293b]">
          <button
            className={`group flex w-full items-center rounded-xl text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 ${isSidebarOpen || isMobileMenuOpen ? "p-3" : "justify-center p-3"}`}
          >
            <LogOut size={20} className="shrink-0" />
            <span
              className={`ml-3 overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-300 ${isSidebarOpen || isMobileMenuOpen ? "w-full opacity-100" : "w-0 opacity-0"}`}
            >
              Đăng nhập
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
