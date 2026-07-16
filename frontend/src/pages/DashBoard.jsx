import React, { useState } from "react";
import SideBar from "../components/layout/SideBar";
import Header from "../components/layout/Header";
import MapView from "../components/map/MapView";
import { SelectionProvider } from "../context/SelectionContext";
import { ThemeProvider } from "../context/ThemeContext";
import MainContent from "../components/layout/MainContent";

const DashBoard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ThemeProvider>
      <SelectionProvider>
        <div className="2xl:flex 2xl:h-dvh 2xl:w-full 2xl:items-center 2xl:justify-center 2xl:bg-slate-100 dark:2xl:bg-slate-950">
          <div className="font-jakarta relative mx-auto flex h-dvh w-full overflow-hidden bg-gray-50 text-gray-900 transition-colors duration-500 2xl:max-h-237.5 2xl:max-w-480 2xl:rounded-2xl 2xl:border 2xl:border-slate-200 2xl:shadow-2xl dark:bg-[#0f172a] dark:text-slate-200 dark:2xl:border-slate-800">
            <SideBar
              isSidebarOpen={isSidebarOpen}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
            <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
              <Header
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
              />
              <MainContent />
            </div>
          </div>
        </div>
      </SelectionProvider>
    </ThemeProvider>
  );
};

export default DashBoard;
