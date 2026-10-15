import React from "react";
import { Route, Routes } from "react-router-dom";

// General pages
import Home from "../pages/home/Home";
import Catalog from "../pages/catalog/Catalog";
import Help from "../pages/help/Help";
import Conditions from "../pages/conditions/Conditions";
import Search from "../pages/search/Search";

// Products pages
import Category from "../pages/category/Category";
import ProductDetail from "../pages/productDetail/ProductDetail";
import NewProduct from "../pages/newProduct/NewProduct";

// Auth pages
import Login from "../pages/login/Login";
import Register from "../pages/register/Register";

// User specific pages
import Profile from "../pages/profile/Profile";
import Favorite from "../pages/favorite/Favorite";
import Balance from "../pages/balance/Balance";
import Cart from "../pages/cart/Cart";
import NotFound from "../pages/notFound/NotFound";

import RequireAuth from "../components/requireAuth/RequireAuth";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/help" element={<Help />} />
      <Route path="/conditions" element={<Conditions />} />

      {/* Products routes */}
      <Route path="/products" element={<Home />} />
      <Route
        path="/products/new"
        element={
          <RequireAuth adminOnly>
            <NewProduct />
          </RequireAuth>
        }
      />
      <Route path="/products/:category" element={<Category />} />
      <Route path="/product/:slug" element={<ProductDetail />} />

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User specific routes */}
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path="/favorite"
        element={
          <RequireAuth>
            <Favorite />
          </RequireAuth>
        }
      />
      <Route
        path="/balance"
        element={
          <RequireAuth>
            <Balance />
          </RequireAuth>
        }
      />
      <Route path="/cart" element={<Cart />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
