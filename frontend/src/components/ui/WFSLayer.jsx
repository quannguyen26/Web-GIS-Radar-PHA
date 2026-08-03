import React, { useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON } from "react-leaflet";
import { GEOSERVER_WFS_URL } from "../../lib/constants";
import { useTheme } from "../../context/ThemeContext";
import createOnEachFeature from "../../lib/createOnEachFeature";
/**
 * Component to fetch and display GeoServer WFS layers for Provinces and Districts.
 *
 * Features:
 * - Fetches WFS GeoJSON data for provinces and districts from GeoServer.
 * - Interactive hover effect with dynamic tooltips showing territory names.
 * - district layer is fetched and displayed only when current map zoom level > 8.
 *
 */
const ProvinceWFSLayer = ({ zoomThreshold = 8, currentZoom }) => {
  const [provinceGeoJson, setProvinceGeoJson] = useState(null);
  const [districtGeoJson, setDistrictGeoJson] = useState(null);
  const { isDarkMode } = useTheme();
  const hasFetchedDistrict = useRef(false);

  const styleLayers = useMemo(
    () => ({
      provinceStyle: {
        color: isDarkMode ? "#f0f0f0" : "#000000",
        weight: 0.5,
        opacity: 1,
        fillColor: "transparent",
      },
      districtStyle: {
        color: isDarkMode ? "#a78bfa" : "#512DA8",
        weight: 0.5,
        fillColor: "transparent",
        dashArray: "3,3",
      },
      hoverStyle: {
        weight: 1.5,
        color: isDarkMode ? "#f0f0f0" : "#000000",
        dashArray: null,
      },
    }),
    [isDarkMode],
  );

  // Fetch province WFS layer on component mount
  useEffect(() => {
    let isMounted = true;
    const provinceUrl = `${GEOSERVER_WFS_URL}?version=1.0.0&request=GetFeature&typeName=radar:all_new_provinces_2025&outputFormat=application/json&srsName=EPSG:4326`;
    fetch(provinceUrl)
      .then((res) => {
        if (!res.ok)
          throw new Error(`Failed to fetch province WFS: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        console.log(data);
        if (isMounted) setProvinceGeoJson(data);
      })
      .catch((err) => console.error("Error loading Province WFS layer:", err));
    return () => {
      isMounted = false;
    };
  }, []);
  // Lazy fetch district WFS layer only when zoom level first reaches the threshold (> 8)
  useEffect(() => {
    if (currentZoom <= zoomThreshold || hasFetchedDistrict.current) return;

    hasFetchedDistrict.current = true;
    let isMounted = true;

    const districtUrl = `${GEOSERVER_WFS_URL}?version=1.0.0&request=GetFeature&typeName=radar:all_new_districts_2025&outputFormat=application/json&srsName=EPSG:4326`;
    fetch(districtUrl)
      .then((res) => {
        if (!res.ok)
          throw new Error(`Failed to fetch district WFS: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        console.log(data);
        if (isMounted) setDistrictGeoJson(data);
      })
      .catch((err) => {
        // Reset flag so it can retry on next zoom-in
        hasFetchedDistrict.current = false;
        console.error("Error loading District WFS layer:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [currentZoom]);

  return (
    <>
      {/* Province GeoJSON Layer */}
      {provinceGeoJson && (
        <GeoJSON
          key={`province-wfs-layer-${isDarkMode}-${currentZoom > zoomThreshold}`}
          data={provinceGeoJson}
          style={styleLayers.provinceStyle}
          pane="paneBoundaryProvinces"
          interactive={currentZoom <= zoomThreshold}
          onEachFeature={createOnEachFeature(
            false,
            styleLayers.provinceStyle,
            styleLayers.hoverStyle,
          )}
        />
      )}
      {/* district GeoJSON Layer (Visible ONLY when zoom level > 8) */}
      {currentZoom > zoomThreshold && districtGeoJson && (
        <GeoJSON
          key={`district-wfs-layer-${isDarkMode}-${hasFetchedDistrict}`}
          data={districtGeoJson}
          style={styleLayers.districtStyle}
          pane="paneDistricts"
          onEachFeature={createOnEachFeature(
            true,
            styleLayers.districtStyle,
            styleLayers.hoverStyle,
          )}
        />
      )}
    </>
  );
};
export default ProvinceWFSLayer;
