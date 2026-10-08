import React, { useState } from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Sidebar from "./Sidebar";
import { renderWithProviders } from "../../test/utils";

const mockMatchMedia = (matches: boolean) => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
};

const Harness = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        menu
      </button>
      <Sidebar open={open} onClose={() => setOpen(false)} />
    </>
  );
};

describe("Sidebar", () => {
  const original = window.matchMedia;
  afterEach(() => {
    window.matchMedia = original;
  });

  it("is a plain navigation landmark on large screens", () => {
    mockMatchMedia(false);
    renderWithProviders(<Harness />, { route: "/help" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Help" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("becomes a closable modal drawer on small screens", async () => {
    mockMatchMedia(true);
    renderWithProviders(<Harness />);

    await userEvent.click(screen.getByRole("button", { name: "menu" }));
    expect(
      screen.getByRole("dialog", { name: "Site navigation" })
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Close navigation" })
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "menu" }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
