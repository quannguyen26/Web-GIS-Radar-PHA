import { Menu, Search, Sun, Bell, Moon, LogIn } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const Header = ({ isSidebarOpen, setIsSidebarOpen, setIsMobileMenuOpen }) => {
  const { isDarkMode, setIsDarkMode } = useTheme();

  return (
    <header className="z-30 flex h-17 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 transition-colors md:px-6 dark:border-[#4a5361] dark:bg-[#4a5361] dark:backdrop-blur-md">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <button
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-400/10 md:hidden"
          onClick={() => {
            setIsMobileMenuOpen(true);
          }}
        >
          <Menu size={22} />
        </button>

        <button
          className="hidden rounded-xl p-2.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-indigo-500 md:block dark:text-slate-400 dark:hover:bg-slate-800"
          onClick={() => {
            setIsSidebarOpen(!isSidebarOpen);
          }}
          title={isSidebarOpen ? "Thu gọn thanh bên" : "Mở rộng thanh bên"}
        >
          <Menu size={22} />
        </button>

        <div className="relative hidden w-64 items-center sm:flex md:w-70">
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
        <button
          className="rounded-xl border border-gray-200 bg-gray-100 p-2.5 text-slate-600 transition-all hover:bg-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-400 dark:hover:bg-slate-700"
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          className="relative rounded-xl p-2.5 text-gray-400 transition-all hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
          title="Thông báo"
        >
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full border-2 border-[#1e293b] bg-indigo-500 dark:border-slate-900"></span>
        </button>

        <div className="mx-1 h-8 w-px bg-gray-200 dark:bg-slate-800"></div>

        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 p-2 text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95 md:px-4 md:py-2.5 dark:shadow-none">
          <LogIn size={20} className="shrink-0" />
          <span className="hidden text-sm font-bold md:block">Đăng nhập</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
