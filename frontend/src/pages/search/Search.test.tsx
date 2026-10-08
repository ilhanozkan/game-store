import React from "react";
import { screen } from "@testing-library/react";

import Search from "./Search";
import { PRODUCTS_QUERY } from "../../queries/Queries";
import {
  makeProduct,
  renderWithProviders,
  withTypename,
} from "../../test/utils";

const products = [
  makeProduct(),
  makeProduct({
    _id: "64b000000000000000000002",
    name: "JBL Quantum One",
    slug: "jbl-quantum-one",
    brand: "JBL",
    category: "Game Headphones",
    categorySlug: "headphones",
  }),
];

const mocks = [
  {
    request: { query: PRODUCTS_QUERY, variables: {} },
    result: {
      data: { products: products.map((p) => withTypename("Product", p)) },
    },
  },
];

describe("Search page", () => {
  it("finds products with fuzzy matching", async () => {
    renderWithProviders(<Search />, { route: "/search?sr=logitec", mocks });

    expect(
      await screen.findByRole("heading", { name: "Results for “logitec”" })
    ).toBeInTheDocument();
    expect(screen.getByText("1 product found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Logitech G305" })).toBeVisible();
    expect(screen.queryByText("JBL Quantum One")).not.toBeInTheDocument();
  });

  it("says so when nothing matches instead of listing every product", async () => {
    renderWithProviders(<Search />, { route: "/search?sr=toaster", mocks });

    expect(
      await screen.findByText("No products match your search")
    ).toBeInTheDocument();
    expect(screen.queryByText("Logitech G305")).not.toBeInTheDocument();
  });
});
