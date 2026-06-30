import React from "react";
import { useState } from "react";
import { dropdownConfigs } from "../../lib/config/dropdownConfigs";
import { buttonNavItems } from "../../lib/config/navItems";
import { ChevronDown, Check } from "lucide-react";
import { useSelection } from "../../context/SelectionContext";

const Navigation = ({ isSidebarOpen, isMobileMenuOpen }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { selections, setSelections } = useSelection();

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="space-y-1">
        <div
          className={`overflow-hidden px-3 whitespace-nowrap transition-all duration-300 ${isSidebarOpen || isMobileMenuOpen ? "block h-5" : "hidden"}`}
        >
          <span className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase dark:text-slate-500">
            Tùy Chọn
          </span>
        </div>
        {dropdownConfigs.map((config) => {
          const selected = selections[config.id];
          const isOpen = activeDropdown === config.id;
          const showText = isSidebarOpen || isMobileMenuOpen;
          const Icon = config.icon;
          return (
            <div key={config.id} className="group relative">
              <button
                className={`flex w-full items-center rounded-xl transition-all ${
                  showText
                    ? `border p-2 ${isOpen ? "border-indigo-200 bg-indigo-50/30 dark:border-indigo-500/50 dark:bg-indigo-500/10" : "border-transparent hover:bg-slate-400/5 dark:hover:bg-slate-700/50"}`
                    : "justify-center border border-transparent p-3 hover:bg-slate-400/5 dark:hover:bg-slate-700/50"
                } `}
                onClick={() =>
                  showText && setActiveDropdown(isOpen ? null : config.id)
                }
              >
                {/* Icon */}
                <div
                  className={`${showText ? "size-10 rounded-lg border border-gray-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800" : ""} flex items-center justify-center ${config.iconColor}`}
                >
                  <Icon size={22} />
                </div>

                <div
                  className={`ml-3 flex-1 overflow-hidden text-left transition-all duration-700 ${showText ? "w-full" : "hidden"}`}
                >
                  <p className="mb-1 truncate text-xs font-bold whitespace-nowrap text-gray-900 dark:text-slate-200">
                    {selected.name}
                  </p>
                  <p className="text-[10px] font-medium whitespace-nowrap text-gray-400 dark:text-slate-500">
                    {config.label}
                  </p>
                </div>
                {/* Tooltip khi Sidebar thu gọn */}
                {showText && (
                  <ChevronDown
                    size={15}
                    className={`shrink-0 text-gray-400 transition-transform duration-300 dark:text-slate-600 ${isOpen ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              {/* Drop down */}
              {isOpen && showText && (
                <div className="animate-in fade-in slide-in-from-top-2 absolute top-full right-0 left-0 z-20 mt-1 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl duration-200 dark:border-slate-700 dark:bg-[#1e293b]">
                  {config.options.map((opt, i) => {
                    const isDeactive = opt.status === "deactive";
                    return (
                      <button
                        key={i}
                        disabled={isDeactive}
                        onClick={() => {
                          setSelections((prev) => ({
                            ...prev,
                            [config.id]: opt,
                          }));
                          setActiveDropdown(null);
                        }}
                        className={`mb-1 flex w-full items-center gap-3 rounded-xl p-2 text-sm transition-colors last:mb-0 ${
                          isDeactive
                            ? "cursor-not-allowed opacity-40 grayscale"
                            : selected.name === opt.name
                              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                              : "text-gray-500 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-600"
                        } `}
                      >
                        <span className="flex-1 text-left text-xs font-medium whitespace-nowrap">
                          {opt.name}
                        </span>
                        {selected.name === opt.name && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="mx-2 h-px bg-gray-100 dark:bg-slate-800/50" />

        <div
          className={`mb-3 overflow-hidden px-3 whitespace-nowrap transition-all duration-300 ${isSidebarOpen || isMobileMenuOpen ? "block h-5" : "hidden"}`}
        >
          <span className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase dark:text-slate-500">
            Công cụ
          </span>
        </div>

        {/* Tooths Items */}
        {buttonNavItems.map((item, idx) => {
          const showText = isSidebarOpen || isMobileMenuOpen;
          const Icon = item.icon;
          return (
            <div key={idx} className="group relative">
              <button
                className={`flex w-full items-center rounded-lg transition-all ${showText ? "p-3" : "justify-center p-2"} ${
                  item.active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:shadow-none"
                    : "text-gray-500 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                } `}
              >
                <span className="shrink-0">{<Icon size={22} />}</span>
                {/* Hiệu ứng trượt cho menu label */}
                <span
                  className={`ml-7 overflow-hidden text-left text-xs font-medium whitespace-nowrap transition-all duration-300 ${showText ? "w-full" : "hidden"}`}
                >
                  {item.name}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
