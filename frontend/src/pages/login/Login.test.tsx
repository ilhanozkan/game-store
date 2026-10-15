import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GraphQLError } from "graphql";

import Login from "./Login";
import { LOGIN_MUTATION } from "../../queries/Mutations";
import { makeUser, renderWithProviders, withTypename } from "../../test/utils";

const loginMock = (identifier: string, password: string) => ({
  request: {
    query: LOGIN_MUTATION,
    variables: { input: { identifier, password } },
  },
});

describe("Login", () => {
  beforeEach(() => window.localStorage.clear());

  it("signs in, stores the session and returns to the requested page", async () => {
    renderWithProviders(<Login />, {
      route: "/login?redirect=%2Fcart",
      path: "/login",
      mocks: [
        {
          ...loginMock("fola", "gamestore123"),
          result: {
            data: {
              login: withTypename("AuthPayload", {
                token: "signed-token",
                user: withTypename("User", makeUser()),
              }),
            },
          },
        },
      ],
    });

    await userEvent.type(screen.getByLabelText("Username or email"), "fola");
    await userEvent.type(screen.getByLabelText("Password"), "gamestore123");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent("/cart")
    );
    expect(window.localStorage.getItem("game-store:token")).toBe(
      "signed-token"
    );
  });

  it("shows the API's error message when sign-in fails", async () => {
    renderWithProviders(<Login />, {
      route: "/login",
      path: "/login",
      mocks: [
        {
          ...loginMock("fola", "wrong-password"),
          result: {
            errors: [new GraphQLError("Invalid username or password")],
          },
        },
      ],
    });

    await userEvent.type(screen.getByLabelText("Username or email"), "fola");
    await userEvent.type(screen.getByLabelText("Password"), "wrong-password");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid username or password"
    );
    expect(window.localStorage.getItem("game-store:token")).toBeNull();
  });

  it("keeps the submit button disabled until both fields are filled", async () => {
    renderWithProviders(<Login />, { route: "/login", path: "/login" });
    const submit = screen.getByRole("button", { name: "Sign in" });

    expect(submit).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Username or email"), "fola");
    expect(submit).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Password"), "x");
    expect(submit).toBeEnabled();
  });
});
