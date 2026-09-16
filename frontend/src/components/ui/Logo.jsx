import React from "react";
import { X } from "lucide-react";
import LogoImg from "../../assets/LogoImg.png";

const Logo = ({ isSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  return (
    <div className="flex h-17 shrink-0 items-center justify-between border-b border-gray-100 px-1 md:justify-normal md:gap-3 dark:border-slate-800">
      <img className="flex size-18 shrink-0" src={LogoImg}></img>

      <h1
        className={`overflow-hidden text-lg font-bold tracking-tight whitespace-nowrap text-gray-900 transition-all duration-500 dark:text-white ${isSidebarOpen || isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
      >
        <span className="bg-linear-to-r from-indigo-600 to-[oklch(45%_0.22_290)] bg-clip-text font-sans text-lg font-bold tracking-wide text-transparent">
          RA ĐA PHA ĐIN
        </span>
      </h1>

      <button
        className="text-slate-400 transition-colors hover:text-gray-900 md:hidden dark:hover:text-white"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <X size={22} />
      </button>
    </div>
  );
};

export default Logo;
