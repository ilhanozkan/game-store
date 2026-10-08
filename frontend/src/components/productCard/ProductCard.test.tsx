import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProductCard from "./ProductCard";
import { makeProduct, renderWithProviders } from "../../test/utils";

describe("ProductCard", () => {
  beforeEach(() => window.localStorage.clear());

  it("shows the product and links to its page and category", () => {
    renderWithProviders(<ProductCard product={makeProduct()} />);

    expect(screen.getByRole("link", { name: "Logitech G305" })).toHaveAttribute(
      "href",
      "/product/logitech-g305"
    );
    expect(
      screen.getByRole("link", { name: "Computer Mouse" })
    ).toHaveAttribute("href", "/products/mouse");
    expect(screen.getByText("₦59,000")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /Rated 4.8 out of 5 from 451 reviews/ })
    ).toBeInTheDocument();
  });

  it("switches to a quantity stepper capped at the stock", async () => {
    renderWithProviders(<ProductCard product={makeProduct({ stock: 2 })} />);

    await userEvent.click(screen.getByRole("button", { name: /add to cart/i }));
    const increase = screen.getByRole("button", {
      name: "Increase quantity of Logitech G305",
    });
    await userEvent.click(increase);

    expect(screen.getByRole("group")).toHaveTextContent("2");
    expect(increase).toBeDisabled();
    expect(screen.getByText("Only 2 left")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Decrease quantity of Logitech G305" })
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Decrease quantity of Logitech G305" })
    );
    expect(
      screen.getByRole("button", { name: /add to cart/i })
    ).toBeInTheDocument();
  });

  it("confirms additions with a toast that opens the cart", async () => {
    renderWithProviders(<ProductCard product={makeProduct()} />);

    await userEvent.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Added Logitech G305 to your cart"
    );
    expect(screen.getByRole("button", { name: "View cart" })).toBeVisible();
  });

  it("shows sold-out products without letting them be added", () => {
    renderWithProviders(<ProductCard product={makeProduct({ stock: 0 })} />);

    expect(screen.getByText("Out of stock")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sold out/i })).toBeDisabled();
  });

  it("asks signed-out visitors to log in before saving favorites", async () => {
    renderWithProviders(<ProductCard product={makeProduct()} />, {
      route: "/products/mouse",
    });

    await userEvent.click(
      screen.getByRole("button", { name: "Add Logitech G305 to favorites" })
    );

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/login?redirect=%2Fproducts%2Fmouse"
    );
  });
});
