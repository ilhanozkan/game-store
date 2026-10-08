import { ApolloLink, execute, gql, Observable } from "@apollo/client";
import { GraphQLError } from "graphql";

import { errorLink, setUnauthenticatedHandler } from "./client";

const QUERY = gql`
  query getMyOrders {
    myOrders {
      _id
    }
  }
`;
const LOGIN = gql`
  mutation login {
    login {
      token
    }
  }
`;

// Answers every operation with an UNAUTHENTICATED error.
const unauthenticated = new ApolloLink(
  () =>
    new Observable((observer) => {
      observer.next({
        errors: [
          new GraphQLError("You must be signed in to do that", {
            extensions: { code: "UNAUTHENTICATED" },
          }),
        ],
      });
      observer.complete();
    })
);

const run = (query: typeof QUERY, withToken: boolean) =>
  new Promise<void>((resolve) => {
    execute(errorLink.concat(unauthenticated), {
      query,
      context: withToken ? { headers: { authorization: "Bearer t" } } : {},
    }).subscribe({ complete: resolve, error: () => resolve() });
  });

describe("errorLink", () => {
  const handler = jest.fn();
  beforeEach(() => {
    handler.mockClear();
    setUnauthenticatedHandler(handler);
  });
  afterAll(() => setUnauthenticatedHandler(null));

  it("ends the session when the API rejects the stored token", async () => {
    await run(QUERY, true);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("ignores errors for signed-out requests and failed logins", async () => {
    await run(QUERY, false);
    await run(LOGIN, true);
    expect(handler).not.toHaveBeenCalled();
  });
});
