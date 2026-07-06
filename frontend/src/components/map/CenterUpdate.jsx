import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { locationPHA } from "../../lib/constants";
const CenterUpdater = ({ selectedCenter, selectedRegion, setZoomLevel }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedRegion === "Bắc Bộ") {
      // Mở rộng giới hạn zoom trước để tránh bị clamp khi setView
      map.setMinZoom(7);
      map.setMaxZoom(10);
      // Di chuyển mượt mà về Bắc Bộ
      map.setView(locationPHA, 7, { animate: true, duration: 1 });
      setZoomLevel(7);
    } else if (selectedCenter) {
      // Tạm thời mở giới hạn zoom hoàn toàn để fitBounds hoạt động chính xác
      map.setMinZoom(1);
      map.setMaxZoom(20);
      // Di chuyển mượt mà tới tỉnh được chọn
      map.fitBounds(selectedCenter, { animate: true, duration: 0.8 });

      // Lắng nghe sự kiện di chuyển kết thúc để khóa zoom level chính xác
      const handleMoveEnd = () => {
        const currentZoom = map.getZoom();
        map.setMinZoom(currentZoom);
        map.setMaxZoom(currentZoom + 1);
        setZoomLevel(currentZoom);
      };

      map.once("moveend", handleMoveEnd);

      // Cleanup listener khi component bị unmount hoặc selectRegion thay đổi giữa chừng
      return () => {
        map.off("moveend", handleMoveEnd);
      };
    }
  }, [selectedRegion, selectedCenter, map, setZoomLevel]);
  return null;
};

export default CenterUpdater;
