import React from "react";
import { dropdownConfigs } from "../lib/data";
import {
  LayerGroup,
  CircleMarker,
  Popup,
  MapContainer,
  TileLayer,
  ZoomControl,
  ScaleControl,
  Pane,
  GeoJSON,
  LayersControl,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useRef, useEffect, useMemo } from "react";
import ProductLayer from "./ui/ProductLayer";
import GetMapInfoHandler from "./handler/GetMapInfoHandler";
import { useSelection } from "./context/SelectionContext";

const boundsNorthVN = L.latLngBounds([17.7, 101.5], [25.2, 108.0]);

const MainContent = () => {

  const { selections } = useSelection();

  const selectedRegion = selections.region.name;

  // const position = [21.328, 103.91];
  return (
    <main className="z-30 flex min-h-0 w-full flex-1 overflow-hidden">
      <MapContainer
        center={[21.57139, 103.51694]}
        zoom={7}
        minZoom={7}
        maxZoom={10}
        zoomSnap={0.1}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={120}
        maxBounds={boundsNorthVN}
        scrollWheelZoom={true}
        className="h-full w-full cursor-pointer!"
        zoomControl={false}
      >
        {/* <ZoomControl position="topright" /> */}
        <ScaleControl position="bottomleft" />

        <Pane name="Provinces2" style={{ zIndex: 550 }} />
        <Pane name="paneRadar" style={{ zIndex: 600 }} />
        <Pane name="paneProvinces" style={{ zIndex: 660 }} />
        <Pane name="paneDistricts" style={{ zIndex: 650 }} />

        <TileLayer
          key="layer-base-gray"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          attribution='<a href="">mr.nguyenkhacquan@gmail.com</a>'
        />

        <TileLayer
          key="layer-provinces-mask"
          url="https://radarphadin.com.vn/geoserver/radar/gwc/service/tms/1.0.0/radar:new_north_vietnam_2025_provinces@EPSG:3857@png/{z}/{x}/{y}.png"
          pane="Provinces2"
          tms={true}
        />

        <TileLayer
          key="layer-provinces-boundary"
          url="https://radarphadin.com.vn/geoserver/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=radar:new_north_vietnam_2025_provinces&STYLE=radar:province_style&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png"
          pane="paneProvinces"
          transparent={true}
        />

        {["Cấp xã", "Điểm dự báo"].includes(selectedRegion) && (
          <TileLayer
            key={selectedRegion}
            url={`https://radarphadin.com.vn/geoserver/gwc/service/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=radar:${
              selectedRegion === "Cấp xã" ? "new_north_vietnam_2025_districts" : "new_merge_districts_2025"
            }&STYLE=radar:${
              selectedRegion === "Cấp xã" ? "district_style" : "merge_district_style"
            }&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png`}
            pane="paneDistricts"
            transparent={true}
          />
        )}

        {/* Thêm key cố định để tránh unmount khi các layer tĩnh thay đổi cấu trúc */}
        <ProductLayer key="radar-product-layer" />
      </MapContainer>
      {console.log("main-content render")}
    </main>
  );
};

export default React.memo(MainContent);
