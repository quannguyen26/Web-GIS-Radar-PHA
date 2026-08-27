import { createContext, useContext, useState, useMemo } from "react";


const LayerToggleContext = createContext();

export const LayerToggleProvider = ({ children }) => {
  const [layerVisibility, setLayerVisibility] = useState({
    radarStations: false,
    mergeDistricts: false,
  });

  const value = useMemo(
    () => ({ layerVisibility, setLayerVisibility }),
    [layerVisibility],
  );

  return (
    <LayerToggleContext.Provider value={value}>
      {" "}
      {children}{" "}
    </LayerToggleContext.Provider>
  );
};

export const useLayerToggle = () => useContext(LayerToggleContext);
