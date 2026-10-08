import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Cart from "./Cart";
import { ME_QUERY } from "../../queries/Queries";
import { CHECKOUT_MUTATION } from "../../queries/Mutations";
import { CartItem, User } from "../../types/Types";
import { makeUser, renderWithProviders, withTypename } from "../../test/utils";

const cartItem: CartItem = {
  productId: "64b000000000000000000001",
  slug: "logitech-g305",
  name: "Logitech G305",
  price: 59000,
  img: null,
  stock: 18,
  quantity: 2,
};

const meMock = (user: User) => ({
  request: { query: ME_QUERY },
  result: { data: { me: withTypename("User", user) } },
});

const signIn = () => window.localStorage.setItem("game-store:token", "token");

describe("Cart page", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem("game-store:cart", JSON.stringify([cartItem]));
  });

  it("lists items with totals and asks signed-out visitors to sign in", () => {
    renderWithProviders(<Cart />, { route: "/cart" });

    expect(screen.getByText("2 items")).toBeInTheDocument();
    expect(screen.getAllByText("₦118,000").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: "Sign in to check out" })
    ).toHaveAttribute("href", "/login?redirect=%2Fcart");
  });

  it("blocks checkout when the balance is too low", async () => {
    signIn();
    renderWithProviders(<Cart />, {
      route: "/cart",
      mocks: [meMock(makeUser({ balance: 100000 }))],
    });

    expect(await screen.findByText(/₦18,000 short/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pay ₦118,000" })).toBeDisabled();
    expect(
      screen.getByRole("link", { name: "Top up your balance" })
    ).toHaveAttribute("href", "/balance");
  });

  it("places the order, clears the cart and confirms", async () => {
    signIn();
    renderWithProviders(<Cart />, {
      route: "/cart",
      mocks: [
        meMock(makeUser()),
        {
          request: {
            query: CHECKOUT_MUTATION,
            variables: {
              items: [{ productId: cartItem.productId, quantity: 2 }],
            },
          },
          result: {
            data: {
              checkout: withTypename("Order", {
                _id: "64b0000000000000000000ff",
                reference: "0000FF",
                total: 118000,
                itemCount: 2,
                createdAt: "2026-10-08T12:00:00.000Z",
              }),
            },
          },
        },
        meMock(makeUser({ balance: 382000 })),
      ],
    });

    await userEvent.click(
      await screen.findByRole("button", { name: "Pay ₦118,000" })
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Order #0000FF is confirmed: 2 items for ₦118,000"
    );
    expect(screen.getByText("Thanks for your order!")).toBeInTheDocument();
    await waitFor(() =>
      expect(window.localStorage.getItem("game-store:cart")).toBe("[]")
    );
  });
});
