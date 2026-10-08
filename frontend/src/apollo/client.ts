import { ApolloClient, HttpLink, InMemoryCache, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

import { getToken } from "../utils/storage";

export const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/graphql";

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
    link: from([authLink, new HttpLink({ uri: API_URL })]),
    cache: new InMemoryCache(),
  });
