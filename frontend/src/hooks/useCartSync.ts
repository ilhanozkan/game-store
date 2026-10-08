import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@apollo/client";

import { useCart } from "../context/CartContext";
import { PRODUCTS_QUERY } from "../queries/Queries";
import { ProductsData } from "../types/Types";

/**
 * Re-checks saved cart lines against the live catalog while `active` (the
 * cart page, or the drawer while open). The cart is stored in the browser, so
 * prices, stock or whole products may have changed since items were added.
 * Returns a notice describing any corrections, and a way to re-check (e.g.
 * after a failed checkout).
 */
const useCartSync = (active: boolean) => {
  const { items, syncWithCatalog } = useCart();
  const [notice, setNotice] = useState("");
  const { data, refetch } = useQuery<ProductsData>(PRODUCTS_QUERY, {
    skip: !active || items.length === 0,
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (!data) return;
    const changes = syncWithCatalog(data.products);
    if (changes.length > 0) setNotice(changes.join(" "));
  }, [data, syncWithCatalog]);

  const recheck = useCallback(() => {
    refetch().catch(() => {});
  }, [refetch]);

  return { notice, clearNotice: () => setNotice(""), recheck };
};

export default useCartSync;
