import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { AppProvider } from "./context/AppContext";
import App from "./App";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </HashRouter>
  </React.StrictMode>,
);
