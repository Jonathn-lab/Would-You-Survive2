/**
 * main.jsx
 * Application entry point. Mounts the React app into the DOM.
 *
 * - Wraps the app in React.StrictMode for development warnings and checks.
 * - Uses BrowserRouter with a basename of "/WYS2.0" so all routes are
 *   prefixed under that path (useful for deployment on a subdirectory).
 * - Imports the global stylesheet (styles.css) for the entire application.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

/* Create a React root attached to the #root div in index.html and render the app */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* basename matches Vite base path: /WYS2.0 in production, / in local dev */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
