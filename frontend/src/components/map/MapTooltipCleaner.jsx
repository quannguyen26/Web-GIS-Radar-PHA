import L from "leaflet";
import { useMapEvents } from "react-leaflet";
/**
 * Component to close all ToolTip when move or zoom map.
 */
const closeTooltips = (layer) => {
  // Standalone tooltips opened on the map (see createOnEachFeature)
  if (layer instanceof L.Tooltip) {
    layer.close();
    return;
  }

  if (typeof layer.closeTooltip === "function") {
    layer.closeTooltip();
  }

  if (typeof layer.eachLayer === "function") {
    layer.eachLayer(closeTooltips);
  }
};

const MapTooltipCleaner = () => {
  // Tooltips can be re-opened by mouseover while the map moves under a
  // stationary cursor, so also close them when the move/zoom ends.
  const handleClose = (event) => {
    event.target.eachLayer(closeTooltips);
  };

  useMapEvents({
    dragstart: handleClose,
    movestart: handleClose,
    moveend: handleClose,
    zoomstart: handleClose,
    zoomend: handleClose,
  });

  return null;
};

export default MapTooltipCleaner;
