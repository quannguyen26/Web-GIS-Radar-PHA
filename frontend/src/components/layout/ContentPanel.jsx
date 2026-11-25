import React from "react";
import { Outlet } from "react-router-dom";

// Layout route for full pages shown inside the dashboard (admin, bulletins...).
// It covers the map area instead of replacing it, so the map stays mounted
// (no reload, same zoom and animation) when the user comes back to "/".
// z-1100 keeps it above every Leaflet pane and map control (max z-1001).
const ContentPanel = () => {
  return (
    <div className="absolute inset-0 z-1100 overflow-y-auto bg-slate-50 dark:bg-[#0f172a]">
      <Outlet />
    </div>
  );
};

export default ContentPanel;
