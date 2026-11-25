import React from "react";
import { Outlet } from "react-router-dom";
import MapView from "../map/MapView";

const MainContent = () => {
  return (
    // relative: anchor for pages that cover the map (see ContentPanel)
    <main className="relative z-30 flex min-h-0 w-full flex-1 overflow-hidden">
      <MapView />
      {/* Nested routes of "/": the login modal or a page over the map */}
      <Outlet />
    </main>
  );
};

export default MainContent;
