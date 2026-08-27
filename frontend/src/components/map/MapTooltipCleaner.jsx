import { useMapEvents } from "react-leaflet";
/**
 * Component to close all ToolTip when move or zoom map.
 */
const closeTooltips = (layer) => {
  if (typeof layer.closeTooltip === "function") {
    layer.closeTooltip();
  }

  if (typeof layer.eachLayer === "function") {
    layer.eachLayer(closeTooltips);
  }
};

const MapTooltipCleaner = () => {
  useMapEvents({
    movestart: (event) => {
      event.target.eachLayer(closeTooltips);
    },
    zoomstart: (event) => {
      event.target.eachLayer(closeTooltips);
    },
  });

  return null;
};

export default MapTooltipCleaner;
