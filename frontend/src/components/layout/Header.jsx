import { useEffect, useRef, useState } from "react";
import {
  Bell,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const Header = ({ isSidebarOpen, setIsSidebarOpen, setIsMobileMenuOpen }) => {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const openDropdown = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const closeDropdown = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsDropdownOpen(false);
  };

  const closeDropdownWithDelay = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
      timeoutRef.current = null;
    }, 150);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      closeDropdown();
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const displayName = user?.fullName || user?.username || "Người dùng";
  const userInitial = (user?.username || displayName)
    .trim()
    .charAt(0)
    .toUpperCase();
  const displayRole =
    user?.roleName || user?.titleName || user?.organizationName || "";

  return (
    <header className="relative z-40 flex h-17 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 transition-colors md:px-6 dark:border-[#4a5361] dark:bg-[#4a5361] dark:backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-400/10 md:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Mở menu trên thiết bị di động"
        >
          <Menu size={22} />
        </button>

        <button
          type="button"
          className="hidden rounded-xl p-2.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-indigo-500 md:block dark:text-slate-400 dark:hover:bg-slate-800"
          onClick={() => setIsSidebarOpen((previous) => !previous)}
          title={isSidebarOpen ? "Thu gọn thanh bên" : "Mở rộng thanh bên"}
          aria-label={isSidebarOpen ? "Thu gọn thanh bên" : "Mở rộng thanh bên"}
        >
          <Menu size={22} />
        </button>

        <div className="relative hidden w-64 items-center sm:flex md:w-70">
          <Search
            className="absolute left-3 cursor-pointer text-slate-500"
            size={16}
          />
          <input
            type="search"
            placeholder="Tìm kiếm..."
            aria-label="Tìm kiếm"
            className="w-full rounded-xl border border-transparent bg-gray-100 py-2 pr-4 pl-10 text-sm transition-all outline-none focus:border-gray-200 focus:bg-white dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-slate-700 dark:focus:bg-slate-800"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-xl border border-gray-200 bg-gray-100 p-2.5 text-slate-600 transition-all hover:bg-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-400 dark:hover:bg-slate-700"
          onClick={() => setIsDarkMode((previous) => !previous)}
          title={isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
          aria-label={
            isDarkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"
          }
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          className="relative rounded-xl p-2.5 text-gray-400 transition-all hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
          title="Thông báo"
          aria-label="Thông báo"
        >
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full border-2 border-[#1e293b] bg-indigo-500 dark:border-slate-900"></span>
        </button>

        <div className="mx-1 h-8 w-px bg-gray-200 dark:bg-slate-800" />

        {isLoading ? (
          <div
            className="h-9 w-9 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
            aria-hidden="true"
          />
        ) : isAuthenticated ? (
          <div
            ref={dropdownRef}
            className="relative py-1"
            onMouseEnter={openDropdown}
            onMouseLeave={closeDropdownWithDelay}
            onFocus={openDropdown}
          >
            <button
              type="button"
              onClick={() => setIsDropdownOpen((previous) => !previous)}
              className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-linear-to-tr from-indigo-600 to-indigo-500 font-bold text-white shadow-md ring-2 shadow-indigo-600/20 ring-transparent transition-all duration-200 hover:scale-105 hover:ring-indigo-300 focus:outline-none dark:hover:ring-indigo-400/50"
              title={displayName}
              aria-label="Tài khoản người dùng"
              aria-haspopup="menu"
              aria-controls="user-menu"
              aria-expanded={isDropdownOpen}
            >
              <span>{userInitial}</span>
              <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-[#4a5361]"></span>
            </button>

            <div
              id="user-menu"
              role="menu"
              aria-hidden={!isDropdownOpen}
              className={`absolute top-full right-0 z-50 w-72 pt-2 transition-all duration-200 ease-out ${
                isDropdownOpen
                  ? "pointer-events-auto visible translate-y-0 opacity-100"
                  : "pointer-events-none invisible translate-y-2 opacity-0"
              }`}
            >
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-2.5 shadow-2xl dark:border-slate-700/80 dark:bg-slate-900">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm">
                    {userInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {displayName}
                    </p>
                    {user?.username && (
                      <p className="truncate text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        @{user.username}
                      </p>
                    )}
                    {user?.email && (
                      <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                {displayRole && (
                  <div className="mt-2 flex items-center justify-between border-b border-gray-100 px-3 pb-2.5 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <span className="font-medium">Chức vụ / Đơn vị:</span>
                    <span className="max-w-40 truncate rounded-md bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                      {displayRole}
                    </span>
                  </div>
                )}

                <div className="mt-1.5 flex flex-col gap-0.5">
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <User size={15} className="text-slate-400" />
                    <span>Thông tin tài khoản</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <Settings size={15} className="text-slate-400" />
                    <span>Cài đặt hệ thống</span>
                  </button>
                </div>

                <div className="my-1.5 border-t border-gray-100 dark:border-slate-800" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    closeDropdown();
                    logout();
                  }}
                  className="group/logout flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                >
                  <LogOut
                    size={15}
                    className="transition-transform group-hover/logout:translate-x-0.5"
                  />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 p-2 text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95 md:px-4 md:py-2.5 dark:shadow-none"
            title="Đăng nhập"
            aria-label="Đăng nhập"
          >
            <LogIn size={20} className="shrink-0" />
            <span className="hidden text-sm font-bold md:block">Đăng nhập</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
