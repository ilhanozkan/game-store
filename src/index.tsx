import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

import "./index.css";
// eslint-disable-next-line import/no-cycle
import App from "./App";
import { GameStoreProvider } from "./context/GameStoreContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Router>
    <GameStoreProvider>
      <App />
    </GameStoreProvider>
  </Router>
);
