import React, { createContext, useState, useEffect } from "react";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [responseData, setResponseData] = useState(null);

  useEffect(() => {
    if (!!responseData) return;

    const localMetadata = JSON.parse(localStorage.getItem("metadata"));
    if (localMetadata) setResponseData(localMetadata);
  }, [responseData])

  return (
    <DataContext.Provider value={{ responseData, setResponseData }}>
      {children}
    </DataContext.Provider>
  );
};

