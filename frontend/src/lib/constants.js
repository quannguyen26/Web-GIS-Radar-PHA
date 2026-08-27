import L from "leaflet";
import { SatelliteDish, Map } from "lucide-react";
/** Base URL của GeoServer */
export const GEOSERVER_BASE_URL = "https://radarphadin.com.vn/geoserver";

/** Base URL của Backend API */
export const API_BASE_URL = "http://localhost:5001/api";

/** URL WMS của GeoServer (dùng cho GetFeatureInfo) */
export const GEOSERVER_WMS_URL = `${GEOSERVER_BASE_URL}/radar/wms`;

/** URL WMS-C của GeoServer (dùng cho tile layer products) */
export const GEOSERVER_WMSC_URL = `${GEOSERVER_BASE_URL}/radar/gwc/service/wms`;

/** URL WMTS của GeoServer (dùng cho base/boundary layers) */
export const GEOSERVER_WMTS_URL = `${GEOSERVER_BASE_URL}/gwc/service/wmts`;

/** URL WFS của GeoServer (dùng để fetch data JSON) */

export const GEOSERVER_WFS_URL = `${GEOSERVER_BASE_URL}/radar/wfs`;

export const boundsNorthVN = L.latLngBounds([17.7, 101.5], [25.2, 108.0]);

// ** location PHA radar
export const locationPHA = [21.57139, 103.51694];
//** map panes */
export const panes = [
  { name: "paneMaskProvinces", zIndex: 550 },
  { name: "paneRadarProducts", zIndex: 600 },
  { name: "paneDistricts", zIndex: 640 },
  { name: "panePointForecast", zIndex: 650 },
  { name: "paneBoundaryProvinces", zIndex: 660 },
  { name: "paneRadarStations", zIndex: 700 },
];

/**
 * Cấu hình các lớp bản đồ có thể bật/tắt
 */
export const layerControlConfigs = [
  {
    id: "radarStations",
    label: "Trạm Ra đa",
    description: "Vị trí các trạm ra đa thời tiết",
    icon: SatelliteDish,
    iconColor: "text-amber-500",
    defaultVisible: true,
  },
  {
    id: "mergeDistricts",
    label: "Điểm dự báo",
    description: "Lớp gộp xã/phường",
    icon: Map,
    iconColor: "text-emerald-500",
    defaultVisible: false,
  },
];
