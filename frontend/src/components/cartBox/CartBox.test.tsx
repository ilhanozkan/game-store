import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CartBox from "./CartBox";
import { useCart } from "../../context/CartContext";
import { makeProduct, renderWithProviders } from "../../test/utils";

const Harness = () => {
  const { openCart, addItem } = useCart();
  return (
    <>
      <button type="button" onClick={() => addItem(makeProduct())}>
        add
      </button>
      <button type="button" onClick={openCart}>
        open cart
      </button>
      <CartBox />
    </>
  );
};

describe("CartBox", () => {
  beforeEach(() => window.localStorage.clear());

  it("opens as a modal dialog and moves focus inside", async () => {
    renderWithProviders(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "add" }));
    await userEvent.click(screen.getByRole("button", { name: "open cart" }));

    const dialog = screen.getByRole("dialog", { name: /your cart \(1\)/i });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    renderWithProviders(<Harness />);
    const trigger = screen.getByRole("button", { name: "open cart" });
    await userEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it("keeps keyboard focus inside the drawer", async () => {
    renderWithProviders(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "open cart" }));

    const dialog = screen.getByRole("dialog");
    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await userEvent.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
  });
});
