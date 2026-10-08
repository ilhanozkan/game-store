import React from "react";
import { act, renderHook } from "@testing-library/react";

import {
  CartProvider,
  cartReducer,
  MAX_PER_PRODUCT,
  useCart,
} from "./CartContext";
import { makeProduct } from "../test/utils";
import { CartItem } from "../types/Types";

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  productId: "p1",
  slug: "p1",
  name: "Product 1",
  price: 1000,
  img: null,
  stock: 5,
  quantity: 1,
  ...overrides,
});

describe("cartReducer", () => {
  it("adds new items and merges repeat adds", () => {
    const { quantity, ...details } = item();
    let state = cartReducer([], { type: "add", item: details, quantity: 2 });
    state = cartReducer(state, { type: "add", item: details, quantity: 1 });

    expect(state).toHaveLength(1);
    expect(state[0].quantity).toBe(3);
  });

  it("never exceeds the available stock or the per-order limit", () => {
    const { quantity, ...details } = item({ stock: 2 });
    const state = cartReducer([], { type: "add", item: details, quantity: 5 });
    expect(state[0].quantity).toBe(2);

    const plenty = item({ stock: 1000 });
    const updated = cartReducer([plenty], {
      type: "update",
      productId: plenty.productId,
      quantity: 500,
    });
    expect(updated[0].quantity).toBe(MAX_PER_PRODUCT);
  });

  it("ignores sold-out products", () => {
    const { quantity, ...details } = item({ stock: 0 });
    expect(
      cartReducer([], { type: "add", item: details, quantity: 1 })
    ).toEqual([]);
  });

  it("removes items whose quantity drops to zero", () => {
    const state = cartReducer([item()], {
      type: "update",
      productId: "p1",
      quantity: 0,
    });
    expect(state).toEqual([]);
  });
});

describe("CartProvider", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  );

  beforeEach(() => window.localStorage.clear());

  it("tracks counts and totals", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(makeProduct({ _id: "a", price: 1000 }), 2);
      result.current.addItem(makeProduct({ _id: "b", price: 500 }));
    });

    expect(result.current.itemCount).toBe(3);
    expect(result.current.subtotal).toBe(2500);
    expect(result.current.getQuantity("a")).toBe(2);
    expect(result.current.getQuantity("missing")).toBe(0);

    act(() => result.current.clearCart());
    expect(result.current.items).toEqual([]);
  });

  it("persists the cart across reloads", () => {
    const first = renderHook(() => useCart(), { wrapper });
    act(() => first.result.current.addItem(makeProduct(), 2));
    first.unmount();

    const second = renderHook(() => useCart(), { wrapper });
    expect(second.result.current.itemCount).toBe(2);
  });

  it("ignores corrupted stored data", () => {
    window.localStorage.setItem(
      "game-store:cart",
      JSON.stringify([{ productId: 1 }, "junk", item()])
    );
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toEqual([item()]);

    window.localStorage.setItem("game-store:cart", "{not json");
    const broken = renderHook(() => useCart(), { wrapper });
    expect(broken.result.current.items).toEqual([]);
  });
});
