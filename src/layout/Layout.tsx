import React from "react";

import CartPanel from "./cartPanel/CartPanel";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import Sidebar from "./sidebar/Sidebar";
import AppRoutes from "../routes/AppRoutes";

const Layout = () => {
  return (
    <div>
      <Header />
      <Sidebar />
      <CartPanel />
      <AppRoutes />
      <Footer />
    </div>
  );
};

export default Layout;
