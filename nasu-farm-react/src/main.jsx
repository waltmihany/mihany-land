import React from "react";
import { createRoot } from "react-dom/client";
import FarmApp from "./FarmApp.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FarmApp />
  </React.StrictMode>
);
