import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { locationPHA } from "../../lib/constants";
import { dropdownConfigs } from "../../lib/config/dropdownConfigs";
import { useSelection } from "../../context/SelectionContext";
import React from "react";
const CenterUpdater = () => {
  const { selections} = useSelection();
  const selectedRegion = selections.region.name;
  const map = useMap();
  const selectedCenter = dropdownConfigs[2].options.find(
    (opt) => opt.name === selectedRegion,
  ).centerLocation;
  useEffect(() => {
    if (selectedRegion === "Bắc Bộ") {
      map.setMinZoom(7);
      map.setMaxZoom(10);
      // Di chuyển mượt mà về Bắc Bộ
      map.setView(locationPHA, 7, { animate: true, duration: 1 });
      
    } else if (selectedCenter) {
      map.setMinZoom(1);
      map.setMaxZoom(20);

      map.fitBounds(selectedCenter, { animate: true, duration: 0.8 });

      // Lắng nghe sự kiện di chuyển
      const handleMoveEnd = () => {
        map.setMinZoom(9);
        map.setMaxZoom(10);
        
      };

      map.once("moveend", handleMoveEnd);

      // Cleanup listener khi component bị unmount hoặc selectRegion thay đổi giữa chừng
      return () => {
        map.off("moveend", handleMoveEnd);
      };
    }
  }, [selectedRegion, selectedCenter,]);
  return null;
};

export default CenterUpdater;
