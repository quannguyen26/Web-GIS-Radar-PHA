import {
  MapContainer,
  TileLayer,
  Pane,
  WMSTileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ProductLayer from "./ProductLayer";
import { useSelection } from "../../context/SelectionContext";
import { useTheme } from "../../context/ThemeContext";
import {
  GEOSERVER_WMS_URL,
  GEOSERVER_WMTS_URL,
  locationPHA,
} from "../../lib/constants";
import { boundsNorthVN } from "../../lib/constants";
import { useState, useEffect } from "react";
import ZoomTracker from "./ZoomTracker";
import { dropdownConfigs } from "../../lib/config/dropdownConfigs";

const MapView = () => {
  const { selections } = useSelection();
  const { isDarkMode } = useTheme();
  const [zoomLevel, setZoomLevel] = useState(7);

  const selectedRegion = selections.region.name;
  const selectedCenter = dropdownConfigs[2].options.find(
    (opt) => opt.name === selectedRegion,
  ).centerLocation;

  console.log(selectedCenter);

  const CenterUpdater = () => {
    const map = useMap();
    useEffect(() => {
      map.fitBounds(selectedCenter, { maxZoom: 10 });
    }, [selectedCenter, map]);
    return null;
  };

  const themeKey = isDarkMode ? "dark" : "light";

  return (
    <main className="z-30 flex min-h-0 w-full flex-1 overflow-hidden">
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
        <ZoomTracker setZoomLevel={setZoomLevel} />

        <Pane name="Provinces2" style={{ zIndex: 550 }} />
        <Pane name="paneRadar" style={{ zIndex: 600 }} />
        <Pane name="paneProvinces" style={{ zIndex: 660 }} />
        <Pane name="paneDistricts" style={{ zIndex: 650 }} />

        {/* Base Layer */}
        <TileLayer
          key={`layer-base-${themeKey}`}
          url={`https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${isDarkMode ? "Dark" : "Light"}_Gray_Base/MapServer/tile/{z}/{y}/{x}`}
        />

        {/* North Viet Nam Provinces Mask Layer */}
        <TileLayer
          key={`${themeKey}-provinces-mask`}
          url={`${GEOSERVER_WMTS_URL}?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=radar:new_north_vietnam_2025_provinces&STYLE=radar:${themeKey}-provinces-mask&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png`}
          pane="Provinces2"
          transparent={true}
        />

        <TileLayer
          key={`${themeKey}_provinces_style`}
          url={`${GEOSERVER_WMTS_URL}?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=radar:new_north_vietnam_2025_provinces&STYLE=radar:${themeKey}_province_style&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png`}
          pane="paneProvinces"
          transparent={true}
        />

        {zoomLevel >= 8 &&
          (selectedRegion === "Bắc Bộ" ? (
            <TileLayer
              key="district-layer"
              url={`${GEOSERVER_WMTS_URL}?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=radar:new_north_vietnam_2025_districts&STYLE=radar:district_style&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png`}
              pane="paneDistricts"
              transparent={true}
            />
          ) : (
            <WMSTileLayer
              url={`${GEOSERVER_WMS_URL}`}
              layers="radar:new_north_vietnam_2025_districts"
              format="image/png"
              transparent={true}
              version="1.1.1"
              styles="radar:district_style"
              pane="paneDistricts"
              params={{ CQL_FILTER: `tenTinh = '${selectedRegion}'` }}
            />
          ))}

        {console.log(zoomLevel)}

        <ProductLayer key="radar-product-layer" />
        <CenterUpdater />
      </MapContainer>
    </main>
  );
};

export default MapView;
