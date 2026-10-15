import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";

import RouteChangeManager from "./RouteChangeManager";

const App = () => (
  <>
    <RouteChangeManager mainId="main" />
    <Link to="/next">next</Link>
    <main id="main" tabIndex={-1}>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/next" element={<h1>Next page</h1>} />
      </Routes>
    </main>
  </>
);

describe("RouteChangeManager", () => {
  // jsdom doesn't implement scrolling.
  beforeEach(() => {
    window.scrollTo = jest.fn();
  });

  it("leaves focus alone on the first render", () => {
    render(
      <React.StrictMode>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </React.StrictMode>
    );
    expect(document.body).toHaveFocus();
  });

  it("moves focus to the new page's heading after navigating", async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    await userEvent.click(screen.getByRole("link", { name: "next" }));
    expect(screen.getByRole("heading", { name: "Next page" })).toHaveFocus();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
