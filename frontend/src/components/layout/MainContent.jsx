import React from "react";
import MapView from "../map/MapView";

const MainContent = () => {
  return (
    <main className="z-30 flex min-h-0 w-full flex-1 overflow-hidden">
      <MapView />
    </main>
  );
};

export default MainContent;
