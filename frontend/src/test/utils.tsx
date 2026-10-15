import React from "react";
import { render } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { Product, User } from "../types/Types";

export const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  _id: "64b000000000000000000001",
  name: "Logitech G305",
  slug: "logitech-g305",
  brand: "Logitech",
  category: "Computer Mouse",
  categorySlug: "mouse",
  price: 59000,
  stock: 18,
  img: "/images/products/logitech-g305.png",
  rating: 4.8,
  reviewCount: 451,
  ...overrides,
});

export const makeUser = (overrides: Partial<User> = {}): User => ({
  _id: "64b0000000000000000000aa",
  name: "Fola",
  username: "fola",
  email: "fola@example.com",
  img: null,
  role: "CUSTOMER",
  balance: 500000,
  favorites: [],
  createdAt: "2026-10-01T10:00:00.000Z",
  ...overrides,
});

// Adds the __typename fields Apollo's cache needs to match fragments.
export const withTypename = <T extends object>(typename: string, value: T) => ({
  __typename: typename,
  ...value,
});

// Renders the current location so tests can assert on navigation.
export const LocationDisplay = () => {
  const location = useLocation();
  return (
    <div data-testid="location">{`${location.pathname}${location.search}`}</div>
  );
};

type Options = {
  route?: string;
  path?: string;
  mocks?: MockedResponse[];
};

export const renderWithProviders = (
  ui: React.ReactElement,
  { route = "/", path = "*", mocks = [] }: Options = {}
) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path={path} element={ui} />
              {path !== "*" && (
                <Route path="*" element={<div>Another page</div>} />
              )}
            </Routes>
            <LocationDisplay />
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    </MockedProvider>
  );
