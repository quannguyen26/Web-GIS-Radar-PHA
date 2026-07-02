import { useMapEvents } from "react-leaflet";

const ZoomTracker = ({ setZoomLevel }) => {
  useMapEvents({
    zoomend: (e) => {
      setZoomLevel(e.target.getZoom());
    },
  });
  return null;
};

export default ZoomTracker;
