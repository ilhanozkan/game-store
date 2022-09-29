import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

import "./index.css";
// eslint-disable-next-line import/no-cycle
import App from "./App";
import { GameStoreProvider } from "./context/GameStoreContext";

const client = new ApolloClient({
  uri: process.env.REACT_APP_API_URL,
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <Router>
    <ApolloProvider client={client}>
      <GameStoreProvider>
        <App />
      </GameStoreProvider>
    </ApolloProvider>
  </Router>
);
