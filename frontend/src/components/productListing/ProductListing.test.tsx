import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProductListing from "./ProductListing";
import { PRODUCTS_QUERY } from "../../queries/Queries";
import {
  makeProduct,
  renderWithProviders,
  withTypename,
} from "../../test/utils";

const cheap = makeProduct({
  _id: "64b0000000000000000000a1",
  name: "Cheap",
  slug: "cheap",
  price: 1000,
});
const pricey = makeProduct({
  _id: "64b0000000000000000000a2",
  name: "Pricey",
  slug: "pricey",
  price: 9000,
});

const productsMock = (sort: string, products = [cheap, pricey]) => ({
  request: { query: PRODUCTS_QUERY, variables: { sort } },
  result: {
    data: { products: products.map((p) => withTypename("Product", p)) },
  },
});

const names = () =>
  screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);

describe("ProductListing", () => {
  it("sorts through the API and keeps the order in the URL", async () => {
    renderWithProviders(<ProductListing title="All products" />, {
      route: "/?sort=price_desc",
      mocks: [
        productsMock("PRICE_DESC", [pricey, cheap]),
        productsMock("PRICE_ASC", [cheap, pricey]),
      ],
    });

    expect(await screen.findByText("Pricey")).toBeInTheDocument();
    expect(names()).toEqual(["Pricey", "Cheap"]);
    expect(screen.getByRole("combobox", { name: "Sort by" })).toHaveValue(
      "PRICE_DESC"
    );

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Sort by" }),
      "PRICE_ASC"
    );

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/?sort=price_asc"
    );
    await waitFor(() => expect(names()).toEqual(["Cheap", "Pricey"]));
  });

  it("explains a failed re-sort instead of silently keeping the old order", async () => {
    renderWithProviders(<ProductListing title="All products" />, {
      mocks: [
        productsMock("FEATURED"),
        {
          request: { query: PRODUCTS_QUERY, variables: { sort: "RATING" } },
          error: new Error("Network down"),
        },
      ],
    });

    await screen.findByText("Pricey");
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Sort by" }),
      "RATING"
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Showing the previous results"
    );
    expect(names()).toEqual(["Cheap", "Pricey"]);
  });
});
