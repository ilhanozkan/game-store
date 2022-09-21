import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

// General pages
import Home from "../pages/home/Home";
import Catalog from "../pages/catalog/Catalog";
import Help from "../pages/help/Help";
import Conditions from "../pages/conditions/Conditions";
import Search from "../pages/search/Search";

// Products pages
import Products from "../components/products/Products";
// import Product from "../components/product/Product";
import NewProduct from "../pages/newProduct/NewProduct";

// Auth pages
import Login from "../pages/login/Login";
import Register from "../pages/register/Register";

// User spesific pages
import Profile from "../pages/profile/Profile";
import Favorite from "../pages/favorite/Favorite";
import Balance from "../pages/balance/Balance";
import Cart from "../pages/cart/Cart";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/help" element={<Help />} />
      <Route path="/conditions" element={<Conditions />} />

      {/* Products routes */}
      <Route path="/products" element={<Products />} />
      {/* <Route path="/product/:id" element={<Product />} /> */}
      <Route path="/products/:category" element={<Products />} />
      <Route path="/products/new" element={<NewProduct />} />
      {/* <Route path="/product/update/:id" element={<Product />} /> */}

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User spesific routes */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/favorite" element={<Favorite />} />
      <Route path="/balance" element={<Balance />} />
      <Route path="/cart" element={<Cart />} />

      {/* Redirection */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
