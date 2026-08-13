import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { GeoJSON } from "react-leaflet";
import { GEOSERVER_WFS_URL } from "../../lib/constants";
import { useTheme } from "../../context/ThemeContext";
import createOnEachFeature from "../../lib/createOnEachFeature";

const FORECAST_POINT_LAYER = "radar:all_new_meger_sub_district";

const ForecastPointLayer = () => {
  const [forecastGeoJson, setForecastGeoJson] = useState(null);
  const { isDarkMode } = useTheme();

  const styles = useMemo(() => {
    const baseColor = isDarkMode ? "#c2c2c2ff" : "#333333ff";
    const hoverColor = isDarkMode ? "#e9e9e9ff" : "#333333ff";

    return {
      baseStyle: {
        color: baseColor,
        weight: 0.5,
        opacity: 1,
        fillColor: "transparent",
        fillOpacity: 0,
      },
      hoverStyle: {
        color: hoverColor,
        weight: 1.5,
        opacity: 1,
        fillColor: "transparent",
        fillOpacity: 0,
        dashArray: null,
      },
    };
  }, [isDarkMode]);

  useEffect(() => {
    let isMounted = true;
    const forecastUrl = `${GEOSERVER_WFS_URL}?version=1.0.0&request=GetFeature&typeName=${FORECAST_POINT_LAYER}&outputFormat=application/json&srsName=EPSG:4326`;

    fetch(forecastUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch forecast WFS: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) setForecastGeoJson(data);
      })
      .catch((err) => {
        console.error("Error loading Forecast Point WFS layer:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!forecastGeoJson) return null;

  return (
    <GeoJSON
      key={`forecast-point-wfs-layer-${isDarkMode}`}
      data={forecastGeoJson}
      pane="panePointForecast"
      style={styles.baseStyle}
      onEachFeature={createOnEachFeature(
        true,
        styles.baseStyle,
        styles.hoverStyle,
      )}
    />
  );
};

export default ForecastPointLayer;
