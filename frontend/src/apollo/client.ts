import { ApolloClient, HttpLink, InMemoryCache, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

import { getToken } from "../utils/storage";

export const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/graphql";

let handleUnauthenticated: (() => void) | null = null;

// Lets AuthProvider end the session when the API rejects the stored token.
export const setUnauthenticatedHandler = (handler: (() => void) | null) => {
  handleUnauthenticated = handler;
};

// A token that expires while the app is open makes protected operations fail
// with UNAUTHENTICATED; sign the user out instead of failing silently.
export const errorLink = onError(({ graphQLErrors, operation }) => {
  const sentToken = Boolean(operation.getContext().headers?.authorization);
  const unauthenticated = graphQLErrors?.some(
    (error) => error.extensions?.code === "UNAUTHENTICATED"
  );
  if (sentToken && unauthenticated && operation.operationName !== "login") {
    handleUnauthenticated?.();
  }
});

const authLink = setContext((_, { headers }) => {
  const token = getToken();
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const createApolloClient = () =>
  new ApolloClient({
    link: from([errorLink, authLink, new HttpLink({ uri: API_URL })]),
    cache: new InMemoryCache(),
  });
