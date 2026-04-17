import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  Zap,
  Check,
  Sun,
  Moon,
  MoreVertical,
  ChevronDown,
  DollarSign,
  Briefcase,
  TrendingUp,
  Server,
  Activity,
  Code,
  Palette,
  Cpu,
  Megaphone,
  MapPin,
  Globe,
  Compass,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

/**
 * COMPONENT: SIDEBAR
 * Quản lý thanh điều hướng bên trái với hiệu ứng trượt chữ mượt mà
 */
const SideBar = ({
  isSidebarOpen,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  selections,
  setSelections,
  dropdownConfigs,
  activeDropdown,
  setActiveDropdown,
  menuItems,
}) => {
  return (
    <>
      {/* 1. Mobile Overlay: Xuất hiện khi mở Menu trên điện thoại */}
      {isMobileMenuOpen && (
        <div
          className="animate-in fade-in fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 2. Sidebar Container */}
      <aside
        className={`flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-[#1e293b] ${isSidebarOpen ? "w-64" : "w-20"} ${isMobileMenuOpen ? "fixed inset-y-0 left-0 z-[70] flex w-64 translate-x-0 shadow-2xl" : "relative hidden translate-x-0 md:flex"} `}
      >
        {/* Logo Section */}
        <div className="flex h-16 shrink-0 items-center border-b border-gray-100 px-5 dark:border-slate-800/50">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-500/20">
            D
          </div>
          <span
            className={`ml-3 overflow-hidden text-lg font-bold tracking-tight whitespace-nowrap text-slate-900 transition-all duration-300 dark:text-white ${isSidebarOpen || isMobileMenuOpen ? "w-32 opacity-100" : "w-0 opacity-0"} `}
          >
            Dashy Pro
          </span>
          {/* Nút đóng riêng cho Mobile */}
          {isMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="ml-auto text-slate-400 md:hidden"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Content */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Workspace Dropdowns */}
          <div className="mb-6 space-y-1">
            <div
              className={`mb-2 overflow-hidden px-3 whitespace-nowrap transition-all duration-300 ${isSidebarOpen || isMobileMenuOpen ? "h-4 opacity-100" : "h-0 opacity-0"}`}
            >
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase dark:text-slate-500">
                Workspace
              </span>
            </div>

            {dropdownConfigs.map((config) => {
              const selected = selections[config.id];
              const isOpen = activeDropdown === config.id;
              const showText = isSidebarOpen || isMobileMenuOpen;

              return (
                <div key={config.id} className="group relative">
                  <button
                    onClick={() =>
                      showText && setActiveDropdown(isOpen ? null : config.id)
                    }
                    className={`flex w-full items-center rounded-xl transition-all ${
                      showText
                        ? `border p-2 
                        ${isOpen ? "border-indigo-200 bg-indigo-50/30 dark:border-indigo-500/50 dark:bg-indigo-500/10" : "border-transparent hover:bg-slate-400/5 dark:hover:bg-slate-700/50"}`
                        : "justify-center border border-transparent p-3 hover:bg-slate-400/5 dark:hover:bg-slate-700/50"
                    } `}
                  >
                    <div
                      className={`${showText ? "h-10 w-10 rounded-lg border border-gray-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800" : ""} flex shrink-0 items-center justify-center ${selected.color}`}
                    >
                      {selected.icon}
                    </div>

                    {/* Hiệu ứng trượt cho text dropdown */}
                    <div
                      className={`ml-3 flex-1 overflow-hidden text-left transition-all duration-300 ${showText ? "w-full opacity-100" : "pointer-events-none w-0 opacity-0"}`}
                    >
                      <p className="mb-1 truncate text-xs leading-none font-bold whitespace-nowrap text-gray-900 dark:text-slate-200">
                        {selected.name}
                      </p>
                      <p className="text-[10px] font-medium whitespace-nowrap text-gray-400 dark:text-slate-500">
                        {config.label}
                      </p>
                    </div>
                    {showText && (
                      <ChevronDown
                        size={14}
                        className={`shrink-0 text-gray-400 transition-transform duration-300 dark:text-slate-600 ${isOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>

                  {/* Tooltip khi Sidebar thu gọn */}
                  {!showText && (
                    <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-4 -translate-y-1/2 rounded bg-slate-800 px-2 py-1.5 text-[10px] whitespace-nowrap text-white opacity-0 shadow-xl group-hover:opacity-100">
                      {config.label}: {selected.name}
                    </div>
                  )}
                  {/* Drop down */}
                  {isOpen && showText && (
                    <div className="animate-in fade-in slide-in-from-top-2 absolute top-full right-0 left-0 z-20 mt-1 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl duration-200 dark:border-slate-700 dark:bg-[#1e293b]">
                      {config.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSelections((prev) => ({
                              ...prev,
                              [config.id]: opt,
                            }));
                            setActiveDropdown(null);
                          }}
                          className={`mb-1 flex w-full items-center gap-3 rounded-xl p-2 text-sm transition-colors last:mb-0 ${
                            selected.name === opt.name
                              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                              : "text-gray-500 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800"
                          } `}
                        >
                          <span className={`shrink-0 ${opt.color}`}>
                            {opt.icon}
                          </span>
                          <span className="flex-1 text-left text-xs font-medium whitespace-nowrap">
                            {opt.name}
                          </span>
                          {selected.name === opt.name && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mx-2 mb-4 h-px bg-gray-100 dark:bg-slate-800/50" />
        </nav>

        {/* Logout Section */}
        <div className="border-t border-gray-100 bg-white p-4 dark:border-slate-800 dark:bg-[#1e293b]">
          <button
            className={`group flex w-full items-center rounded-xl text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 ${isSidebarOpen || isMobileMenuOpen ? "p-3" : "justify-center p-3"}`}
          >
            <LogOut size={20} className="shrink-0" />
            <span
              className={`ml-3 overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-300 ${isSidebarOpen || isMobileMenuOpen ? "w-full opacity-100" : "w-0 opacity-0"}`}
            >
              Đăng xuất
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

/**
 * COMPONENT: HEADER
 * Chứa các nút điều khiển trung tâm và Search
 */
const Header = ({
  isSidebarOpen,
  setIsSidebarOpen,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isDarkMode,
  setIsDarkMode,
}) => {
  return (
    <header className="z-[40] flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 transition-colors md:px-6 dark:border-slate-800 dark:bg-[#1e293b]/80 dark:backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Nút Toggle cho Mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-400/10 md:hidden"
        >
          <Menu size={22} />
        </button>

        {/* Nút Toggle cho Desktop */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden p-2 text-slate-500 transition-colors hover:text-indigo-500 md:block"
        >
          <Menu size={20} />
        </button>

        <div className="relative hidden w-64 items-center sm:flex md:w-80">
          <Search className="absolute left-3 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full rounded-xl border border-transparent bg-gray-100 py-2 pr-4 pl-10 text-sm transition-all outline-none focus:border-gray-200 focus:bg-white dark:bg-slate-800/50 dark:text-slate-200 dark:focus:border-slate-700 dark:focus:bg-slate-800"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="rounded-xl border border-gray-200 bg-gray-100 p-2.5 text-slate-600 hover:bg-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-400 dark:hover:bg-slate-700"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="relative rounded-xl p-2.5 text-gray-400 transition-all hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full border-2 border-white bg-indigo-500 dark:border-[#1e293b]"></span>
        </button>

        <div className="mx-1 h-8 w-px bg-gray-200 dark:bg-slate-800"></div>

        <div className="flex cursor-pointer items-center gap-3 pl-1">
          <div className="hidden text-right lg:block">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-200">
              Quang Minh
            </p>
            <p className="text-[10px] font-medium text-slate-500 uppercase">
              Admin
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-xs font-bold text-white">
            QM
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * COMPONENT: MAIN CONTENT (Mẫu)
 */
const MainContent = ({ selections }) => {
  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8 dark:bg-[#0f172a]">
      <div className="mx-auto max-w-7xl space-y-6 text-left">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">
            Bảng điều khiển
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Dự án:{" "}
            <span className="font-semibold text-indigo-500">
              {selections.project.name}
            </span>{" "}
            • Môi trường:{" "}
            <span className="font-semibold text-blue-500">
              {selections.env.name}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1e293b]"
            >
              <div className="mb-4 text-slate-400">
                <Activity size={20} />
              </div>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                Metric {i}
              </p>
              <p className="mt-1 text-2xl font-bold dark:text-white">
                {(Math.random() * 1000).toFixed(0)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

/**
 * MAIN APP COMPONENT
 */
const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Load Font
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const [selections, setSelections] = useState({
    project: {
      name: "Dự án Alpha",
      icon: <Zap size={20} />,
      color: "text-amber-400",
    },
    env: {
      name: "Production",
      icon: <Server size={20} />,
      color: "text-blue-500",
    },
    team: {
      name: "Design Team",
      icon: <Palette size={20} />,
      color: "text-pink-500",
    },
    region: {
      name: "Châu Á (APAC)",
      icon: <MapPin size={20} />,
      color: "text-emerald-500",
    },
  });

  const dropdownConfigs = [
    {
      id: "project",
      label: "Dự án",
      options: [
        {
          name: "Dự án Alpha",
          icon: <Zap size={20} />,
          color: "text-amber-400",
        },
        {
          name: "Bảo mật",
          icon: <ShieldCheck size={20} />,
          color: "text-emerald-400",
        },
        {
          name: "Thị trường",
          icon: <Globe size={20} />,
          color: "text-blue-400",
        },
      ],
    },
    {
      id: "env",
      label: "Môi trường",
      options: [
        {
          name: "Production",
          icon: <Server size={20} />,
          color: "text-blue-500",
        },
        {
          name: "Staging",
          icon: <Activity size={20} />,
          color: "text-purple-500",
        },
        {
          name: "Development",
          icon: <Code size={20} />,
          color: "text-slate-500",
        },
      ],
    },
    {
      id: "team",
      label: "Đội ngũ",
      options: [
        {
          name: "Design Team",
          icon: <Palette size={20} />,
          color: "text-pink-500",
        },
        {
          name: "Engineering",
          icon: <Cpu size={20} />,
          color: "text-indigo-500",
        },
      ],
    },
    {
      id: "region",
      label: "Khu vực",
      options: [
        {
          name: "Châu Á (APAC)",
          icon: <MapPin size={20} />,
          color: "text-emerald-500",
        },
        {
          name: "Bắc Mỹ (NA)",
          icon: <Compass size={20} />,
          color: "text-rose-500",
        },
      ],
    },
  ];

  const menuItems = [
    {
      name: "Bảng điều khiển",
      icon: <LayoutDashboard size={20} />,
      active: true,
    },
    { name: "Người dùng", icon: <Users size={20} />, active: false },
    { name: "Thanh toán", icon: <CreditCard size={20} />, active: false },
    { name: "Cài đặt", icon: <Settings size={20} />, active: false },
  ];

  return (
    <div
      className={`flex h-screen overflow-hidden bg-gray-50 text-gray-900 transition-colors duration-500 dark:bg-[#0f172a] dark:text-slate-200 ${isDarkMode ? "dark" : ""}`}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <SideBar
        isSidebarOpen={isSidebarOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        selections={selections}
        setSelections={setSelections}
        dropdownConfigs={dropdownConfigs}
        activeDropdown={activeDropdown}
        setActiveDropdown={setActiveDropdown}
        menuItems={menuItems}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
        <MainContent selections={selections} />
      </div>
    </div>
  );
};

export default App;
