import { GeoJSON, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSelection } from "../context/SelectionContext";
import { productLegendConfigs } from "../../lib/data";

/**
 * Component xử lý lấy thông tin thuộc tính (GetFeatureInfo) khi click vào bản đồ
 */
const GetMapInfoHandler = ({ timeline }) => {
  const { selections } = useSelection();
  const activeProduct = selections.products.name;
  const unitProduct = productLegendConfigs[activeProduct]?.unit || "";
  const currentTime = timeline?.list[timeline?.index];

  const map = useMapEvents({
    click: async (e) => {
      const size = map.getSize();
      const point = map.latLngToContainerPoint(e.latlng);
      const bounds = map.getBounds();

      const districtsLayer = "radar:new_north_vietnam_2025_districts";
      const productLayer = `radar:${activeProduct.toLowerCase()}_mosaic_index`;

      // 1. Lấy tọa độ 2 điểm góc dưới-trái và trên-phải (hệ 4326)
      const southWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();

      // 2. Ép (project) 2 điểm đó sang hệ mét EPSG:3857
      const swProjected = L.CRS.EPSG3857.project(southWest);
      const neProjected = L.CRS.EPSG3857.project(northEast);

      // Xây dựng các tham số cho dịch vụ GetFeatureInfo
      const params = {
        service: "WMS",
        version: "1.1.1",
        request: "GetFeatureInfo",
        layers: `${districtsLayer},${productLayer}`,
        query_layers: `${districtsLayer},${productLayer}`,
        info_format: "application/json",
        feature_count: 10,
        time: currentTime,
        bbox: [swProjected.x, swProjected.y, neProjected.x, neProjected.y].join(
          ",",
        ),
        width: size.x,
        height: size.y,
        srs: "EPSG:3857",
        x: Math.round(point.x),
        y: Math.round(point.y),
      };

      const url = `https://radarphadin.com.vn/geoserver/radar/wms?${new URLSearchParams(params).toString()}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          let content = "";

          // 1. Tìm feature của đơn vị hành chính
          const adminFeature = data.features.find(
            (f) => f.properties && (f.properties.tenXa || f.properties.tenTinh),
          );

          // 2. Tìm feature của sản phẩm radar dựa vào sự tồn tại của thuộc tính 'GRAY_INDEX'
          const productFeature = data.features.find(
            (f) => f.properties && "GRAY_INDEX" in f.properties,
          );

          if (adminFeature) {
            const p = adminFeature.properties;
            const adminName = p.tenXa ? `${p.loaiXa || ""} ${p.tenXa}` : p.tenTinh;
            const provincePart = p.tenXa ? `<div class="text-[11px] text-slate-500 dark:text-slate-400 italic">(${p.tenTinh})</div>` : "";

            content += `
              <div class="text-sm font-bold text-slate-900 leading-tight mb-0.5">
                ${adminName}
              </div>
              ${provincePart}
            `;
          }

          if (productFeature && productFeature.properties.GRAY_INDEX !== undefined) {
            const value = productFeature.properties.GRAY_INDEX;
            const formattedValue = value != null ? Number(value).toFixed(1) : "0.0";
            content += `
              <div class="mt-1 flex justify-center items-baseline gap-1 dark:border-slate-800">
                <span class="text-[15px] font-black text-indigo-600 dark:text-indigo-400">${formattedValue}</span>
                <span class="text-[13px] font-bold text-slate-400 dark:text-slate-500 tracking-tight">${unitProduct}</span>
              </div>
            `;
          }

          if (content) {
            L.popup({
              minWidth: 140,
              className: "custom-radar-popup"
            })
              .setLatLng(e.latlng)
              .setContent(`<div class="flex flex-col">${content}</div>`)
              .openOn(map);
          }
        }
      } catch (err) {
        console.error("Lỗi khi lấy thông tin GetFeatureInfo:", err);
      }
    },
  });
  return null;
};

export default GetMapInfoHandler;
