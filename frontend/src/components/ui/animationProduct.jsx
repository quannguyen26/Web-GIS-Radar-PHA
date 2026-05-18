import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  WMSTileLayer,
  LayersControl,
} from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const RadarAnimation = () => {
  // 1. States quản lý dữ liệu và animation
  const [timestamps, setTimestamps] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Dùng Ref để lưu timer tránh việc render lại làm mất dấu timer
  const animationRef = useRef(null);

  // 2. Hàm Fetch dữ liệu từ API
  const fetchTimestamps = async () => {
    try {
      const response = await axios.get("/api/time");
      // API trả về mới nhất đứng đầu -> Đảo ngược lại để chạy animation từ cũ đến mới
      const data = response.data.reverse();

      setTimestamps((prev) => {
        // Nếu có dữ liệu mới, cập nhật và giữ nguyên vị trí index nếu đang xem
        // Hoặc nhảy đến cuối nếu là lần đầu
        if (prev.length === 0) setCurrentIndex(data.length - 1);
        return data;
      });
      console.log(
        "Dữ liệu radar đã được cập nhật mới nhất:",
        data[data.length - 1],
      );
    } catch (error) {
      console.error("Lỗi fetch time:", error);
    }
  };

  useEffect(() => {
    // 1. Chạy ngay lập tức lần đầu khi load trang
    fetchTimestamps();

    // 2. Thiết lập vòng lặp kiểm tra mỗi phút (Check mỗi 60 giây)
    const checkTimeInterval = setInterval(() => {
      const now = new Date();
      const minutes = now.getMinutes(); // Lấy phút hiện tại (0-59)

      // 3. Logic: Kiểm tra nếu số phút kết thúc bằng 3 (03, 13, 23, 33, 43, 53)
      // Cách viết gọn: minutes % 10 === 4
      if (minutes % 10 === 4) {
        console.log(
          `Đã đến thời điểm vàng (${minutes}ph), đang cập nhật dữ liệu radar mới...`,
        );
        fetchTimestamps();
      }
    }, 60 * 1000); // Kiểm tra mỗi 1 phút một lần

    // 4. Cleanup để tránh rác bộ nhớ
    return () => clearInterval(checkTimeInterval);
  }, []);

  // 4. Logic chạy Animation
  useEffect(() => {
    if (isPlaying && timestamps.length > 0) {
      animationRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex >= timestamps.length - 1 ? 0 : prevIndex + 1,
        );
      }, 1000);
    } else {
      clearInterval(animationRef.current);
    }
    return () => clearInterval(animationRef.current);
  }, [isPlaying, timestamps]);

  return (
    <>
      {timestamps.length > 0 && (
        <WMSTileLayer
          key={timestamps[currentIndex]} // Key thay đổi buộc Leaflet render lại Layer mà không bị lưu cache cũ
          url="http://your-geoserver-url/geoserver/wms"
          params={{
            layers: "radar:hmax_mosaic",
            format: "image/png",
            transparent: true,
            version: "1.1.1",
            // Tham số quan trọng nhất: Gửi mốc thời gian tương ứng với currentIndex
            time: timestamps[currentIndex],
          }}
          zIndex={100}
        />
      )}

      {/* Bảng điều khiển Animation (UI Overlay) */}
      <div className="absolute flex flex-col items-center p-4 transform -translate-x-1/2 bg-white rounded-lg shadow-lg bottom-10 left-1/2 z-1000 min-w-100">
        <div className="mb-2 font-bold text-blue-700">
          🕒 Thời gian:{" "}
          {timestamps[currentIndex]
            ? new Date(timestamps[currentIndex]).toLocaleString("vi-VN")
            : "Đang tải..."}
        </div>

        <div className="flex items-center w-full gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`rounded px-4 py-2 ${isPlaying ? "bg-red-500" : "bg-green-500"} text-white`}
          >
            {isPlaying ? "Dừng" : "Chạy"}
          </button>

          <input
            type="range"
            className="grow"
            min="0"
            max={timestamps.length - 1}
            value={currentIndex}
            onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
          />

          <span className="text-xs text-gray-500">
            {currentIndex + 1} / {timestamps.length}
          </span>
        </div>
      </div>
    </>
  );
};

export default RadarAnimation;
