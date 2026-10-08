import React from "react";
import { act, renderHook } from "@testing-library/react";

import {
  CartProvider,
  cartReducer,
  loadCart,
  MAX_PER_PRODUCT,
  reconcileCart,
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

describe("reconcileCart", () => {
  const product = makeProduct({ _id: "p1", name: "Product 1", price: 1000 });

  it("leaves an up-to-date cart untouched", () => {
    const items = [item({ stock: product.stock })];
    const result = reconcileCart(items, [product]);
    expect(result.items).toBe(items);
    expect(result.changes).toEqual([]);
  });

  it("removes vanished or sold-out products and explains why", () => {
    const result = reconcileCart(
      [item(), item({ productId: "p2", name: "Gone" })],
      [{ ...product, stock: 0 }]
    );
    expect(result.items).toEqual([]);
    expect(result.changes).toEqual([
      "Product 1 sold out and was removed.",
      "Gone is no longer available and was removed.",
    ]);
  });

  it("caps quantities at the stock left and refreshes prices", () => {
    const result = reconcileCart(
      [item({ quantity: 5 })],
      [{ ...product, stock: 2, price: 1500 }]
    );
    expect(result.items[0]).toMatchObject({
      quantity: 2,
      price: 1500,
      stock: 2,
    });
    expect(result.changes).toEqual([
      "Only 2 of Product 1 left, so we updated the quantity.",
      "Product 1 now costs ₦1,500.",
    ]);
  });
});

describe("loadCart", () => {
  beforeEach(() => window.localStorage.clear());

  it("drops duplicates and lines without a slug, and caps quantities", () => {
    window.localStorage.setItem(
      "game-store:cart",
      JSON.stringify([
        item({ quantity: 9, stock: 3 }),
        item({ quantity: 1 }),
        { ...item({ productId: "p2" }), slug: undefined },
      ])
    );
    expect(loadCart()).toEqual([item({ quantity: 3, stock: 3 })]);
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

  it("follows changes made in other tabs", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(makeProduct(), 1));

    window.localStorage.setItem("game-store:cart", "[]");
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "game-store:cart" })
      );
    });

    expect(result.current.items).toEqual([]);
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
