import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  GeoJSON,
  WMSTileLayer,
  Pane,
  ScaleControl,
  ZoomControl,
} from "react-leaflet";
import * as turf from "@turf/turf";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const boundsNorthVN = L.latLngBounds([18.5, 101.5], [24.2, 108.0]);

const OptimizedRadarMap = () => {
  // === 1. STATES QUẢN LÝ DỮ LIỆU BẢN ĐỒ ===
  const [provincesData, setProvincesData] = useState(null);
  const [districtsData, setDistrictsData] = useState(null);
  const provincesDataRef = useRef(null); // Ref dùng cho thuật toán click không gây re-render

  // === 2. STATES QUẢN LÝ RADAR ANIMATION ===
  const [recentTimestamps, setRecentTimestamps] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalIdRef = useRef(null);

  // === 3. FETCH DỮ LIỆU (Tối ưu tải song song) ===
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const [provRes, distRes] = await Promise.all([
          fetch(
            "https://radarphadin.com.vn/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=radar:new_north_vietnam_2025_provinces&outputFormat=application/json&srsName=EPSG:4326",
          ),
          fetch(
            "https://radarphadin.com.vn/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=radar:new_north_vietnam_2025_districts&outputFormat=application/json&srsName=EPSG:4326",
          ),
        ]);

        const provData = await provRes.json();
        const distData = await distRes.json();

        provincesDataRef.current = provData;
        setProvincesData(provData);
        setDistrictsData(distData);
      } catch (error) {
        console.error("Lỗi tải dữ liệu không gian:", error);
      }
    };

    fetchStaticData();
  }, []);

  // === 4. XỬ LÝ CLICK XÃ (Tối ưu vòng lặp Turf) ===
  const onEachDistrict = useCallback((feature, layer) => {
    layer.on("click", () => {
      let provinceName = "Không xác định";

      if (provincesDataRef.current) {
        const centerPt = turf.center(feature).geometry;
        // Tối ưu: Dùng .find() để dừng vòng lặp ngay khi tìm thấy kết quả
        const foundProvince = provincesDataRef.current.features.find(
          (provFeature) =>
            turf.booleanPointInPolygon(centerPt, provFeature.geometry),
        );
        if (foundProvince) {
          provinceName = foundProvince.properties.tenTinh;
        }
      }
      layer
        .bindPopup(`${feature.properties.tenXa}<br>(${provinceName})`)
        .openPopup();
    });
  }, []);

  // === 5. LOGIC RADAR ANIMATION ===
  const loadRadarData = useCallback(async () => {
    try {
      const res = await fetch(
        "https://radarphadin.com.vn/geoserver/radar/wms?service=WMS&version=1.1.1&request=GetCapabilities",
      );
      const text = await res.text();
      const xmlDoc = new DOMParser().parseFromString(text, "application/xml");

      const layerNode = [...xmlDoc.querySelectorAll("Layer")].find(
        (node) =>
          node.querySelector("Name")?.textContent === "max_mosaic_index",
      );
      const extent = layerNode?.querySelector("Extent[name='time']");
      if (!extent) return;

      const timestamps = extent.textContent
        .trim()
        .split(",")
        .map((ts) => ts.replace(".000Z", "Z"));
      const latestTime = new Date(timestamps[timestamps.length - 1]);
      const twoHoursAgo = new Date(latestTime.getTime() - 2 * 60 * 60 * 1000);

      const recent = timestamps.filter((ts) => {
        const t = new Date(ts);
        return t >= twoHoursAgo && t <= latestTime;
      });

      if (recent.length > 0) {
        setRecentTimestamps(recent);
        setCurrentIndex(recent.length - 1);
      }
    } catch (err) {
      console.error("Lỗi fetch Radar:", err);
    }
  }, []);

  useEffect(() => {
    loadRadarData();
    const cronInterval = setInterval(() => {
      if (new Date().getMinutes() % 10 === 3) loadRadarData();
    }, 60 * 1000);
    return () => clearInterval(cronInterval);
  }, [loadRadarData]);

  const handleNext = () =>
    setCurrentIndex((prev) => (prev + 1) % recentTimestamps.length);
  const handlePrev = () =>
    setCurrentIndex(
      (prev) => (prev - 1 + recentTimestamps.length) % recentTimestamps.length,
    );

  const togglePlay = () => {
    if (isPlaying) {
      clearInterval(intervalIdRef.current);
    } else {
      intervalIdRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % recentTimestamps.length);
      }, 1000);
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    return () => clearInterval(intervalIdRef.current);
  }, []);

  const radarTimeText = useMemo(() => {
    if (recentTimestamps.length === 0) return "Đang tải dữ liệu...";
    return new Date(recentTimestamps[currentIndex]).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [recentTimestamps, currentIndex]);

  // === 6. MEMOIZE TẤT CẢ LAYER TĨNH ĐỂ TRÁNH RE-RENDER (QUAN TRỌNG) ===
  const staticMapLayers = useMemo(
    () => (
      <>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          attribution='<a href="">mr.nguyenkhacquan@gmail.com</a>'
        />
        <TileLayer
          url="https://radarphadin.com.vn/geoserver/radar/gwc/service/tms/1.0.0/radar:new_north_vietnam_2025_provinces@EPSG:3857@png/{z}/{x}/{y}.png"
          pane="Provinces2"
          tms={true}
        />
        {provincesData && (
          <GeoJSON
            key="provinces-layer"
            data={provincesData}
            pane="paneProvinces"
            style={{
              color: "black",
              weight: 0,
              fillColor: "transparent",
              fillOpacity: 1,
            }}
            onEachFeature={(f, l) =>
              l.bindPopup(`${f.properties.loaiTinh} ${f.properties.tenTinh}`)
            }
          />
        )}
        <LayersControl position="topleft" collapsed={true}>
          {districtsData && (
            <LayersControl.Overlay name="Cấp xã" checked>
              <GeoJSON
                key="districts-layer"
                data={districtsData}
                pane="paneDistricts"
                style={{ color: "red", weight: 0.5, fillColor: "transparent" }}
                onEachFeature={onEachDistrict}
              />
            </LayersControl.Overlay>
          )}
        </LayersControl>
      </>
    ),
    [provincesData, districtsData, onEachDistrict],
  ); // Chỉ render lại nếu cục data thay đổi

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <MapContainer
        center={[21.33163, 104.80288]}
        zoom={8}
        minZoom={7}
        maxZoom={10}
        maxBounds={boundsNorthVN}
        maxBoundsViscosity={0.5}
        zoomControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomControl position="topleft" />
        <ScaleControl position="bottomleft" />

        <Pane name="Provinces2" style={{ zIndex: 550 }} />
        <Pane name="paneRadar" style={{ zIndex: 600 }} />
        <Pane name="paneProvinces" style={{ zIndex: 650 }} />
        <Pane name="paneDistricts" style={{ zIndex: 660 }} />

        {/* Chèn các layer tĩnh đã được đóng băng */}
        {staticMapLayers}

        {/* CHỈ CÓ LAYER NÀY (RADAR) LÀ UPDATE MỖI GIÂY */}
        {recentTimestamps.length > 0 && (
          <WMSTileLayer
            url="https://radarphadin.com.vn/geoserver/radar/gwc/service/wms"
            layers="radar:max_mosaic_index"
            format="image/png"
            transparent={true}
            version="1.1.1"
            pane="paneRadar"
            crs={L.CRS.EPSG3857}
            params={{ time: recentTimestamps[currentIndex] }}
          />
        )}
      </MapContainer>

      {/* UI Bảng điều khiển */}
      {/* UI Bảng điều khiển bằng Tailwind CSS */}
      <div className="absolute bottom-4 left-1/2 z-1000 flex w-[90%] max-w-sm -translate-x-1/2 flex-col items-center gap-3 rounded-2xl border border-white/30 bg-white/85 px-4 py-3 shadow-xl backdrop-blur-md transition-all duration-300 md:right-6 md:bottom-6 md:left-auto md:w-auto md:translate-x-0">
        {/* Hiển thị thời gian */}
        <div className="w-full text-center">
          <span className="mb-0.5 block text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Thời gian quét Radar
          </span>
          <strong className="text-sm font-bold text-slate-800 md:text-base">
            {radarTimeText}
          </strong>
        </div>

        {/* Các nút điều khiển */}
        <div className="flex w-full items-center justify-between gap-2 md:justify-center">
          {/* Nút Prev */}
          <button
            onClick={handlePrev}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200/60 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 active:bg-slate-200 md:flex-none md:px-4"
          >
            <span className="text-base">⏮</span>
            <span className="hidden sm:inline">Lùi</span>
          </button>

          {/* Nút Play/Pause (Nổi bật) */}
          <button
            onClick={togglePlay}
            className={`flex min-w-27.5 flex-1 items-center justify-center gap-1.5 rounded-xl px-6 py-2 text-sm font-bold shadow-md transition-all md:flex-none ${
              isPlaying
                ? "bg-rose-500 text-white shadow-rose-500/30 hover:bg-rose-600 active:bg-rose-700"
                : "bg-blue-600 text-white shadow-blue-600/30 hover:bg-blue-700 active:bg-blue-800"
            }`}
          >
            {isPlaying ? (
              <>
                <span className="text-base">⏸</span> Dừng
              </>
            ) : (
              <>
                <span className="text-base">▶</span> Phát
              </>
            )}
          </button>

          {/* Nút Next */}
          <button
            onClick={handleNext}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200/60 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 active:bg-slate-200 md:flex-none md:px-4"
          >
            <span className="hidden sm:inline">Tiếp</span>
            <span className="text-base">⏭</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptimizedRadarMap;


<WMSTileLayer
          url="https://radarphadin.com.vn/geoserver/radar/wms" // Dùng endpoint WMS chuẩn
          layers="radar:new_north_vietnam_2025_provinces"
          styles="polygon_nofill"
          format="image/png"
          transparent={true}
          version="1.1.1" // Thêm version để ổn định
          params={{
            tiled: true, // Ép GeoServer kiểm tra cache GWC
          }}
          pane="Provinces2"
        />