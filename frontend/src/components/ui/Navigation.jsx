import React from "react";
import { useState } from "react";
import { dropdownConfigs } from "../../lib/data";
const Navigation = ({
  isSidebarOpen,
  isMobileMenuOpen,
  selections,
  setSelections,
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="mb-6 space-y-1">
        <div
          className={`overflow-hidden px-3 whitespace-nowrap transition-all duration-300 ${isSidebarOpen || isMobileMenuOpen ? "h-5 opacity-100" : "opacity-0"}`}
        >
          <span className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase dark:text-slate-500">
            Tùy Chọn
          </span>
        </div>
        {dropdownConfigs.map((config) => {
          
        })}
      </div>
    </nav>
  );
};

export default Navigation;
