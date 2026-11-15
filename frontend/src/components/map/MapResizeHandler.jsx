import { useEffect } from "react";
import { useMap } from "react-leaflet";

// Leaflet only listens to window resize. When the map container changes size
// for other reasons (e.g. the sidebar collapses), tell Leaflet to re-measure.
const MapResizeHandler = () => {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    let frameId = null;

    const observer = new ResizeObserver(() => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        frameId = null;
        map.invalidateSize({ animate: false });
      });
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [map]);

  return null;
};

export default MapResizeHandler;
