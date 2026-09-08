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
      {/* Layer Toggle Context Provider */}
      <LayerToggleProvider>
        {/* GeoJson district/province Layers */}
        <WFSLayer />
        {/* Layer Control UI */}
        <LayerControlToggle />
      </LayerToggleProvider>
      {/* Radar Product Layer */}
      <ProductLayer key="radar-product-layer" />
      <CenterUpdater />
    </MapContainer>
  );
};

export default MapView;
