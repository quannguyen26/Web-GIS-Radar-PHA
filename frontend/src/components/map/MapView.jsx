import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ProductLayer from "./ProductLayer";
import { useTheme } from "../../context/ThemeContext";
import {
  GEOSERVER_WMTS_URL,
  locationPHA,
  boundsNorthVN,
} from "../../lib/constants";
import CenterUpdater from "./CenterUpdate";
import WFSLayer from "./WFSLayer";
import MapTooltipCleaner from "./MapTooltipCleaner";
import LayerControlToggle from "../ui/LayerControlToggle";
import MapPanes from "./MapPanes";
import { LayerToggleProvider } from "../../context/LayerToggleContext";

const MapView = () => {
  const { isDarkMode } = useTheme();
  const themeKey = isDarkMode ? "dark" : "light";

  return (
    <MapContainer
      center={locationPHA}
      zoom={7}
      minZoom={7}
      maxZoom={10}
      zoomSnap={0.5}
      zoomDelta={0.5}
      wheelPxPerZoomLevel={120}
      maxBounds={boundsNorthVN}
      scrollWheelZoom={true}
      className="h-full w-full cursor-pointer!"
      zoomControl={false}
      attributionControl={false}
    >
      <MapTooltipCleaner />
      {/* Map Panes Configs */}
      <MapPanes />
      {/* Base Map Dark/Light Layer */}
      <TileLayer
        key={`layer-base-${themeKey}`}
        url={`https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${
          isDarkMode ? "Dark" : "Light"
        }_Gray_Base/MapServer/tile/{z}/{y}/{x}`}
      />{" "}
      {/*Viet Nam Provinces Mask Dark/Light Layer */}
      <TileLayer
        key={`${themeKey}-provinces-mask`}
        url={`${GEOSERVER_WMTS_URL}?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=radar:all_new_provinces_2025&STYLE=radar:${themeKey}-provinces-mask&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png`}
        pane="paneMaskProvinces"
        bounds={[
          [16.188278988000036, 102.14388732800006],
          [23.392738122000026, 108.19501653500004],
        ]}
      />
<<<<<<< HEAD
      {/* North Viet Nam Provinces Boundary Layer */}
      <TileLayer
        key={`${themeKey}_provinces_style`}
        url={`${GEOSERVER_WMTS_URL}?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=radar:all_new_provinces_2025&STYLE=radar:${themeKey}_province_style&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png`}
        pane="paneBoundaryProvinces"
        transparent={true}
        bounds={[
          [16.188278988000036, 102.14388732800006],
          [23.392738122000026, 108.19501653500004],
        ]}
      />{" "}
      {zoomLevel >= 8 &&
        (selectedRegion === "Bắc Bộ" ? (
          <TileLayer
            key="district-layer"
            url={`${GEOSERVER_WMTS_URL}?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=radar:all_new_districts_2025&STYLE=radar:district_style&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png`}
            pane="paneDistricts"
            transparent={true}
            bounds={[
              [19.287700909000023, 102.14388732800006],
              [23.392738122000026, 108.19501653500004],
            ]}
          />
        ) : (
          <WMSTileLayer
            url={`${GEOSERVER_WMS_URL}`}
            layers="radar:all_new_districts_2025"
            format="image/png"
            transparent={true}
            version="1.1.1"
            styles="radar:district_style"
            pane="paneDistricts"
            bounds={[
              [19.287700909000023, 102.14388732800006],
              [23.392738122000026, 108.19501653500004],
            ]}
            params={{ CQL_FILTER: `tentinh = '${selectedRegion}'` }}
          />
        ))}
      {/* === Lớp Trạm Ra đa (toggle) === */}
      {layerVisibility.radarStations &&
        radarStations.map((station) => (
          <CircleMarker
            key={station.name}
            center={station.location}
            radius={5}
            pathOptions={{
              color: "#4f46e5",
              fillColor: "#818cf8",
              fillOpacity: 0.9,
              weight: 1,
            }}
            pane="paneStations"
          >
            <Popup className="station-popup">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Trạm Ra đa {station.name}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  ({station.location[0].toFixed(2)}°N,{"  "}
                  {station.location[1].toFixed(2)}°E)
                </span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      {/* === Merger District Layer (toggle) === */}
      {layerVisibility.mergeDistricts && (
        <TileLayer
          key="merge-districts-layer"
          url={`${GEOSERVER_WMTS_URL}?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=radar:new_merge_districts_2025&STYLE=radar:merge_district_style&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png`}
          pane="paneDistricts"
          transparent={true}
        />
      )}
=======
      {/* Layer Toggle Context Provider */}
      <LayerToggleProvider>
        {/* GeoJson district/province Layers */}
        <WFSLayer />
        {/* Layer Control UI */}
        <LayerControlToggle />
      </LayerToggleProvider>
      {/* Radar Product Layer */}
>>>>>>> change-layer-json
      <ProductLayer key="radar-product-layer" />
      <CenterUpdater />
    </MapContainer>
  );
};

export default MapView;
