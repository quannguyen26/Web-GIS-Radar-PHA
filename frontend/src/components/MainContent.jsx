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

const boundsNorthVN = L.latLngBounds([17.7, 101.5], [25.2, 108.0]);

const MainContent = () => {
  // === 1. STATES QUẢN LÝ DỮ LIỆU BẢN ĐỒ ===
  // const [provincesData, setProvincesData] = useState(null);
  // const [districtsData, setDistrictsData] = useState(null);

  // === 3. FETCH DỮ LIỆU ===
  // useEffect(() => {
  //   const fetchGeoJsonData = async () => {
  //     try {
  //       const [provRes, distRes] = await Promise.all([
  //         fetch(
  //           "https://radarphadin.com.vn/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=radar:new_north_vietnam_2025_provinces&outputFormat=application/json&srsName=EPSG:4326",
  //         ),
  //         fetch(
  //           "https://radarphadin.com.vn/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=radar:new_north_vietnam_2025_districts&outputFormat=application/json&srsName=EPSG:4326",
  //         ),
  //       ]);

  //       const provData = await provRes.json();
  //       const distData = await distRes.json();

  //       setProvincesData(provData);
  //       setDistrictsData(distData);
  //     } catch (error) {
  //       console.error("Lỗi tải dữ liệu không gian:", error);
  //     }
  //   };

  //   fetchGeoJsonData();
  // }, []);

  // === 6. MEMOIZE TẤT CẢ LAYER TĨNH ĐỂ TRÁNH RE-RENDER ===
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

        {/* {provincesData && (
          <GeoJSON
            key="provinces-layer"
            data={provincesData}
            pane="paneProvinces"
            style={{
              color: "black",
              weight: 0.7,
              fillColor: "transparent",
              fillOpacity: 1,
            }}
            onEachFeature={(f, l) =>
              l.bindPopup(
                `${f.properties.loaiTinh} <br> ${f.properties.tenTinh}`,
              )
            }
          />
        )}
        <LayersControl position="topright" collapsed={true}>
          {districtsData && (
            <LayersControl.Overlay name="Cấp xã">
              <GeoJSON
                key="districts-layer"
                data={districtsData}
                pane="paneDistricts"
                style={{ color: "red", weight: 0.2, fillColor: "transparent" }}
                onEachFeature={(f, l) =>
                  l.bindPopup(
                    `${f.properties.loaiXa} ${f.properties.tenXa}<br>(${f.properties.tenTinh})`,
                  )
                }
              />
            </LayersControl.Overlay>
          )}

          <LayersControl.Overlay name="Trạm Ra đa" checked={false}>
            <LayerGroup>
              {dropdownConfigs[0].options.map((station) => (
                <CircleMarker
                  key={station.name}
                  center={station.location}
                  pathOptions={{
                    fillColor: "blue",
                    color: "white",
                    weight: 2,
                    fillOpacity: 0.8,
                  }}
                  radius={6}
                  pane="paneDistricts"
                >
                  <Popup>
                    <div className="font-bold"> Trạm Ra đa {station.name}</div>
                    <div>({station.location.join(", ")})</div>
                  </Popup>
                </CircleMarker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl> */}
      </>
    ),
    [],
  );
  // const position = [21.328, 103.91];
  return (
    <main className="z-30 flex flex-1 w-full min-h-0 overflow-hidden">
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
        className="w-full h-full cursor-pointer!"
        zoomControl={false}
      >
        {/* <ZoomControl position="topright" /> */}
        <ScaleControl position="bottomleft" />

        <Pane name="Provinces2" style={{ zIndex: 550 }} />
        <Pane name="paneRadar" style={{ zIndex: 600 }} />
        <Pane name="paneProvinces" style={{ zIndex: 650 }} />
        <Pane name="paneDistricts" style={{ zIndex: 660 }} />

        {/* Chèn các layer tĩnh đã được đóng băng */}
        {staticMapLayers}

        {/* <GetMapInfoHandler /> */}

        {/* {provincesData && <ProductLayer />} */}
        <ProductLayer />
      </MapContainer>
      {console.log("main-content render")}
    </main>
  );
};

export default React.memo(MainContent);
