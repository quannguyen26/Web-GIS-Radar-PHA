import React, { useEffect } from "react";
import { LogIn, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "../ui/Navigation";
import Logo from "../ui/Logo";
import { useAuth } from "../../context/AuthContext";

const SideBar = ({ isSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Close the drawer when the viewport grows past the mobile breakpoint
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = (event) => {
      if (event.matches) setIsMobileMenuOpen(false);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setIsMobileMenuOpen]);

  // Escape closes the drawer and body scroll is locked while it is open
  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  const handleAuthAction = () => {
    setIsMobileMenuOpen(false);
    if (isAuthenticated) {
      logout();
    } else {
      navigate("/login");
    }
  };

  const isExpanded = isSidebarOpen || isMobileMenuOpen;

  // Extract display initials from full name or username
  const displayName = user?.fullName || user?.username || "Người dùng";
  const displayRole =
    user?.roleName || user?.titleName || user?.organizationName || "Thành viên";
  const userInitial = displayName.trim().charAt(0).toUpperCase();

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="animate-in fade-in fixed inset-0 z-45 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Thanh bên"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white shadow-xl transition-all duration-300 ease-in-out md:relative md:translate-x-0 dark:border-slate-800 dark:bg-[#1e293b] ${
          isSidebarOpen ? "md:w-64" : "md:w-21"
        } ${
          isMobileMenuOpen
            ? "translate-x-0 shadow-2xl"
            : "max-md:invisible max-md:-translate-x-full"
        }`}
      >
        {/* Logo */}
        <Logo
          isSidebarOpen={isSidebarOpen}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Navigation items */}
        <Navigation
          isSidebarOpen={isSidebarOpen}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* User profile & Login/Logout section */}
        <div className="border-t border-gray-100 bg-white p-3 dark:border-slate-800 dark:bg-[#1e293b]">
          {isLoading ? (
            <div
              className="h-11 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
              aria-hidden="true"
            />
          ) : isAuthenticated ? (
            <div className="flex flex-col gap-2">
              {/* User profile info card */}
              {/* <div
                className={`flex items-center rounded-xl bg-slate-50 p-2.5 transition-all dark:bg-slate-900/50 ${
                  isExpanded ? "justify-start gap-3" : "justify-center"
                }`}
                title={`${displayName} (${displayRole})`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-sm">
                  {userInitial}
                </div>

                {isExpanded && (
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {displayName}
                    </p>
                    <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
                      {displayRole}
                    </p>
                  </div>
                )}
              </div> */}

              {/* Logout button */}
              <button
                onClick={handleAuthAction}
                className={`group flex w-full items-center rounded-xl text-rose-500 transition-all hover:bg-rose-50 hover:text-rose-600 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300 ${
                  isExpanded ? "p-2.5" : "justify-center p-2.5"
                }`}
                title="Đăng xuất"
              >
                <LogOut size={20} className="shrink-0" />
                <span
                  className={`ml-2.5 overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    isExpanded ? "w-full opacity-100" : "w-0 opacity-0"
                  }`}
                >
                  Đăng xuất
                </span>
              </button>
            </div>
          ) : (
            /* Login button */
            <button
              onClick={handleAuthAction}
              className={`group flex w-full items-center rounded-xl text-indigo-600 transition-all hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300 ${
                isExpanded ? "p-3" : "justify-center p-3"
              }`}
              title="Đăng nhập"
            >
              <LogIn size={20} className="shrink-0" />
              <span
                className={`ml-3 overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  isExpanded ? "w-full opacity-100" : "w-0 opacity-0"
                }`}
              >
                Đăng nhập
              </span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default SideBar;
