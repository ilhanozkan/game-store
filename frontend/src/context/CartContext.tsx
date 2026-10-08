import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

import { CartItem, Product } from "../types/Types";
import { readStorage, writeStorage } from "../utils/storage";

const STORAGE_KEY = "game-store:cart";
// Mirrors the API's per-order limit for a single product.
export const MAX_PER_PRODUCT = 99;

export const maxQuantityFor = (stock: number) =>
  Math.max(0, Math.min(stock, MAX_PER_PRODUCT));

type Action =
  | { type: "add"; item: Omit<CartItem, "quantity">; quantity: number }
  | { type: "update"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" };

export const cartReducer = (state: CartItem[], action: Action): CartItem[] => {
  switch (action.type) {
    case "add": {
      const max = maxQuantityFor(action.item.stock);
      const existing = state.find((i) => i.productId === action.item.productId);
      if (existing) {
        return state.map((i) =>
          i === existing
            ? {
                ...existing,
                ...action.item,
                quantity: Math.min(existing.quantity + action.quantity, max),
              }
            : i
        );
      }
      if (max === 0 || action.quantity <= 0) return state;
      return [
        ...state,
        { ...action.item, quantity: Math.min(action.quantity, max) },
      ];
    }
    case "update":
      if (action.quantity <= 0) {
        return state.filter((i) => i.productId !== action.productId);
      }
      return state.map((i) =>
        i.productId === action.productId
          ? {
              ...i,
              quantity: Math.min(action.quantity, maxQuantityFor(i.stock)),
            }
          : i
      );
    case "remove":
      return state.filter((i) => i.productId !== action.productId);
    case "clear":
      return [];
    default:
      return state;
  }
};

const isCartItem = (value: unknown): value is CartItem => {
  const item = value as CartItem;
  return (
    typeof item === "object" &&
    item !== null &&
    typeof item.productId === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.stock === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
};

const loadCart = (): CartItem[] => {
  try {
    const parsed = JSON.parse(readStorage(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  getQuantity: (productId: string) => number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    writeStorage(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    dispatch({
      type: "add",
      quantity,
      item: {
        productId: product._id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        img: product.img,
        stock: product.stock,
      },
    });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) =>
      dispatch({ type: "update", productId, quantity }),
    []
  );
  const removeItem = useCallback(
    (productId: string) => dispatch({ type: "remove", productId }),
    []
  );
  const clearCart = useCallback(() => dispatch({ type: "clear" }), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => {
    const quantities = new Map(items.map((i) => [i.productId, i.quantity]));
    return {
      items,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.quantity * i.price, 0),
      getQuantity: (productId: string) => quantities.get(productId) || 0,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      isOpen,
      openCart,
      closeCart,
    };
  }, [
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    isOpen,
    openCart,
    closeCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
};
