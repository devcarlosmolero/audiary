import React from "react";
import ReactDOM from "react-dom/client";

import "./globals.css";
import App from "./App";

document.addEventListener("DOMContentLoaded", () => {
  const updateTheme = () => {
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle(isDarkMode ? "dark" : "light", true);
  };
  updateTheme();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateTheme);
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
