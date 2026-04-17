import React from "react";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import MainContent from "../components/MainContent";
import { useState } from "react";
import { defaultSelections } from "../lib/data";
const DashBoard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selections, setSelections] = useState(defaultSelections);
  return (
    <div
      className={`font-jakarta relative mx-auto flex h-screen w-full max-w-388.25 overflow-hidden bg-gray-50 text-gray-900 transition-colors duration-500 dark:bg-[#0f172a] dark:text-slate-200 ${isDarkMode ? "dark" : ""}`}
    >
      <SideBar
        isSidebarOpen={isSidebarOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        selections={selections}
        setSelections={setSelections}
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
        <MainContent />
      </div>
    </div>
  );
};

export default DashBoard;
