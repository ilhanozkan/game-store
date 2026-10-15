import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";

import "./index.css";
import App from "./App";
import { createApolloClient } from "./apollo/client";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

const client = createApolloClient();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Router>
      <ApolloProvider client={client}>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </ApolloProvider>
    </Router>
  </React.StrictMode>
);
