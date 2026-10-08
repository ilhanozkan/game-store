import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import { CartItem, Product } from "../types/Types";
import formatCurrency from "../utils/CurrencyFormatter";
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
  | { type: "replace"; items: CartItem[] }
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
    case "replace":
      return action.items;
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
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.stock === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
};

// Reads the saved cart, dropping malformed and duplicate lines and keeping
// quantities within the limits the reducer enforces.
export const loadCart = (): CartItem[] => {
  try {
    const parsed = JSON.parse(readStorage(STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed.filter(isCartItem).flatMap((item) => {
      const quantity = Math.min(item.quantity, maxQuantityFor(item.stock));
      if (seen.has(item.productId) || quantity <= 0) return [];
      seen.add(item.productId);
      return [{ ...item, quantity }];
    });
  } catch {
    return [];
  }
};

/**
 * Compares saved cart lines with the current catalog. Returns the corrected
 * lines plus a message per change: products that disappeared or sold out are
 * removed, quantities shrink to the stock left, and prices are refreshed.
 */
export const reconcileCart = (
  items: CartItem[],
  products: Product[]
): { items: CartItem[]; changes: string[] } => {
  const byId = new Map(products.map((p) => [p._id, p]));
  const changes: string[] = [];

  const next = items.flatMap((item) => {
    const product = byId.get(item.productId);
    if (!product) {
      changes.push(`${item.name} is no longer available and was removed.`);
      return [];
    }
    const quantity = Math.min(item.quantity, maxQuantityFor(product.stock));
    if (quantity <= 0) {
      changes.push(`${product.name} sold out and was removed.`);
      return [];
    }
    if (quantity < item.quantity) {
      changes.push(
        `Only ${quantity} of ${product.name} left, so we updated the quantity.`
      );
    }
    if (product.price !== item.price) {
      changes.push(
        `${product.name} now costs ${formatCurrency(product.price)}.`
      );
    }
    return [
      {
        ...item,
        name: product.name,
        slug: product.slug,
        img: product.img,
        price: product.price,
        stock: product.stock,
        quantity,
      },
    ];
  });

  const unchanged =
    changes.length === 0 &&
    next.length === items.length &&
    next.every((line, i) => line.stock === items[i].stock);
  return { items: unchanged ? items : next, changes };
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
  // Applies the latest catalog to the cart; returns what changed.
  syncWithCatalog: (products: Product[]) => string[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadCart);
  const [isOpen, setIsOpen] = useState(false);

  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    writeStorage(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Keep carts open in other tabs in sync (e.g. after checking out in one).
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        dispatch({ type: "replace", items: loadCart() });
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const syncWithCatalog = useCallback((products: Product[]) => {
    const result = reconcileCart(itemsRef.current, products);
    if (result.items !== itemsRef.current) {
      dispatch({ type: "replace", items: result.items });
    }
    return result.changes;
  }, []);

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
      syncWithCatalog,
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
    syncWithCatalog,
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
