import React, { useContext } from "react";
import Home from "./Home";
import { DataContext } from "./dataContext";
import DisplayQueryResults from "./DisplayQueryResults";

export default function App() {
  const { responseData } = useContext(DataContext);

  return !responseData ? <Home /> : <DisplayQueryResults />;
}
