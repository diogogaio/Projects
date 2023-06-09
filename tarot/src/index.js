import { ServerProvider } from "./contexts/ServerContext";
import { AppProvider } from "./contexts/appContexts";
import "bootstrap/dist/css/bootstrap.css";
// Put any other imports below so that CSS from your
// components takes precedence over default styles.
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
//const { error }= useServer();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ServerProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </ServerProvider>
  </React.StrictMode>
);
