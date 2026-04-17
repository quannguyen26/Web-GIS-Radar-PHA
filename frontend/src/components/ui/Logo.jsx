import React from "react";
import { X } from "lucide-react";
import LogoImg from "../../assets/logoImg.png";
import Button from "./Button";

const Logo = ({ isSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  return (
    <div className="flex h-17 shrink-0 items-center justify-between border-b border-gray-100 px-1 md:justify-normal md:gap-3 dark:border-slate-800">
      <img className="flex size-18 shrink-0" src={LogoImg}></img>

      <h1
        className={`overflow-hidden text-xl font-bold tracking-tight whitespace-nowrap text-gray-900 transition-all duration-500 dark:text-white ${isSidebarOpen || isMobileMenuOpen ? "opacity-100" : "opacity-0"}`}
      >
        RA ĐA <span class="font-bold text-indigo-600">PHA ĐIN</span>
      </h1>

      <Button
        className="text-slate-400 transition-colors hover:text-gray-900 md:hidden dark:hover:text-white"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <X size={22} />
      </Button>
    </div>
  );
};

export default Logo;
