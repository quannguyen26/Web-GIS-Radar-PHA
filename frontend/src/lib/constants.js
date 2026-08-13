import L from "leaflet";

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

export const panes = [
  { name: "paneMaskProvinces", zIndex: 550 },
  { name: "paneRadarProducts", zIndex: 600 },
  { name: "paneDistricts", zIndex: 640 },
  { name: "panePointForecast", zIndex: 650 },
  { name: "paneBoundaryProvinces", zIndex: 660 },
  { name: "paneRadarStations", zIndex: 700 },
];
