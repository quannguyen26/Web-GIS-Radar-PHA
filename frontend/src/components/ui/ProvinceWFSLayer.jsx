import React, { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";
import L from "leaflet";
import { GEOSERVER_WFS_URL } from "../../lib/constants";
/**
 * Component to fetch and display GeoServer WFS layers for Provinces and Districts.
 *
 * Features:
 * - Fetches WFS GeoJSON data for provinces and districts from GeoServer.
 * - Interactive hover effect with dynamic tooltips showing territory names.
 * - district layer is conditionally displayed only when current map zoom level > 8.
 *
 */
const ProvinceWFSLayer = ({
  provinceTypeName = "radar:all_new_provinces_2025",
  districtTypeName = "radar:all_new_districts_2025",
  zoomThreshold = 8,
  provinceStyle = {
    color: "#000000", // Viền đen
    weight: 0.5, // Độ dày viền
    opacity: 1, // Độ rõ của viền
    fillOpacity: 0, // Nền trong suốt
  },
  districtStyle = {
    color: "#512DA8",
    weight: 0.5,
    // fillColor: "#34d399",
    fillOpacity: 0,
    dashArray: "4, 4",
  },
  hoverStyle = {
    weight: 1.5,
    color: "#000000",
    fillColor: "#FFFFFF",
    fillOpacity: 0.2,
  },
  currentZoom,
}) => {
  const [provinceGeoJson, setProvinceGeoJson] = useState(null);
  const [districtGeoJson, setdistrictGeoJson] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const url = `${GEOSERVER_WFS_URL}?version=1.0.0&request=GetFeature&typeName=${provinceTypeName}&outputFormat=application/json&srsName=EPSG:4326`;
    fetch(url)
      .then((res) => {
        if (!res.ok)
          throw new Error(`Failed to fetch province WFS: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setProvinceGeoJson(data);
          console.log(data);
        }
      })
      .catch((err) => {
        console.error("Error loading Province WFS layer:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch district WFS GeoJSON data
  useEffect(() => {
    let isMounted = true;

    const url = `${GEOSERVER_WFS_URL}?version=1.0.0&request=GetFeature&typeName=${districtTypeName}&outputFormat=application/json&srsName=EPSG:4326`;
    fetch(url)
      .then((res) => {
        if (!res.ok)
          throw new Error(`Failed to fetch district WFS: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setdistrictGeoJson(data);
          console.log(data);
        }
      })
      .catch((err) => {
        console.error("Error loading district WFS layer:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to extract feature name for display in tooltip
  const getFeatureDisplayName = (feature, isDistrict = false) => {
    if (!feature || !feature.properties) return "Không có tên";
    const p = feature.properties;
    if (isDistrict) {
      const districtName = p.tenxa || p.xa_gop || p.ten_xa;
      const districtType = p.loaixa ? `${p.loaixa} ` : "";
      const provinceName = p.tentinh || p.ten_tinh || "";
      if (districtName) {
        return provinceName
          ? `${districtType}${districtName}<br>(${provinceName})`
          : `${districtType}${districtName}`;
      }
    }
    // Default to province property names, combining captỉnh and tentinh directly
    const typeProvince = p.captinh || p.cap_tinh || "";
    const nameProvince = p.tentinh || p.ten_tinh || "";
    if (typeProvince && nameProvince) {
      return `${typeProvince} ${nameProvince}`.trim();
    }
    return nameProvince || "Đơn vị hành chính";
  };

  // Event handler for each feature (Hover highlight and Tooltip binding)
  const createOnEachFeature = (isDistrictLayer = false, baseStyle = {}) => {
    return (feature, layer) => {
      const name = getFeatureDisplayName(feature, isDistrictLayer);
      // Bind interactive tooltip on hover. Styling is managed in index.css (.wfs-feature-tooltip) to support dark mode and override Leaflet defaults.
      layer.bindTooltip(name, {
        permanent: false,
        direction: "top",
        sticky: true,
        className: "wfs-feature-tooltip",
      });
      // Mouse events for hover styling
      layer.on({
        mouseover: (e) => {
          const target = e.target;
          target.setStyle(hoverStyle);
          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            target.bringToFront();
          }
        },
        mouseout: (e) => {
          const target = e.target;
          target.setStyle(baseStyle);
        },
      });
    };
  };

  return (
    <>
      {/* Province GeoJSON Layer (Always visible, but disabled from interaction when zoom > threshold to let hovers fall through to the district/commune layer) */}
      {provinceGeoJson && (
        <GeoJSON
          key={`province-wfs-layer-${provinceTypeName}-${currentZoom > zoomThreshold}`}
          data={provinceGeoJson}
          style={provinceStyle}
          pane="paneBoundaryProvinces"
          interactive={currentZoom <= zoomThreshold}
          onEachFeature={createOnEachFeature(false, provinceStyle)}
        />
      )}
      {/* district GeoJSON Layer (Visible ONLY when zoom level > 8) */}
      {currentZoom > zoomThreshold && districtGeoJson && (
        <GeoJSON
          key={`district-wfs-layer-${districtTypeName}`}
          data={districtGeoJson}
          style={districtStyle}
          pane="paneDistricts"
          onEachFeature={createOnEachFeature(true, districtStyle)}
        />
      )}
    </>
  );
};
export default ProvinceWFSLayer;
