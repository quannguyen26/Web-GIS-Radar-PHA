import React from "react";

import Navigation from "./ui/Navigation";
import Logo from "./ui/Logo";

const SideBar = ({
  isSidebarOpen,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  selections,
  setSeclections,
}) => {
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
          selections={selections}
          setSeclections={setSeclections}
        />
      </aside>
    </>
  );
};

export default SideBar;
