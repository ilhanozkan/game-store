import React from "react";
import { screen } from "@testing-library/react";

import NotFound from "./NotFound";
import { renderWithProviders } from "../../test/utils";

describe("NotFound", () => {
  it("explains the problem, offers a way back and sets the title", () => {
    renderWithProviders(<NotFound />, { route: "/nope" });

    expect(
      screen.getByRole("heading", { name: "This level doesn't exist" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to the store" })
    ).toHaveAttribute("href", "/");
    expect(document.title).toBe("Page not found · Game Drill");
  });
});
