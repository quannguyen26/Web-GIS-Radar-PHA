import React, { createContext, useContext, useState, useMemo } from "react";
import { defaultSelections } from "../lib/config/dropdownConfigs.js";

const SelectionContext = createContext();

export const SelectionProvider = ({ children }) => {
  const [selections, setSelections] = useState(defaultSelections);

  const value = useMemo(() => ({ selections, setSelections }), [selections]);

  return (
    <SelectionContext.Provider value={value}>
      {" "}
      {children}{" "}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => useContext(SelectionContext);
