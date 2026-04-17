import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  ScaleControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
const MainContent = () => {
  const position = [21.328, 103.91];
  return (
    <main className="z-30 flex w-full flex-1 overflow-y-auto">
      <MapContainer
        center={[21.33163, 104.80288]}
        zoom={8}
        minZoom={7}
        maxZoom={10}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        <ScaleControl position="bottomleft" />
        {/* Lớp bản đồ nền từ OpenStreetMap */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          attribution='<a href="">mr.nguyenkhacquan@gmail.com</a>'
        />

        <Marker position={position}>
          <Popup>Sơn La</Popup>
        </Marker>
      </MapContainer>
    </main>
  );
};

export default MainContent;
