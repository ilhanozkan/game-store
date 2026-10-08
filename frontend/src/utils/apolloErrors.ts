import { ApolloError } from "@apollo/client";

const isApolloError = (error: unknown): error is ApolloError =>
  error instanceof ApolloError;

// Returns the extensions.code of the first GraphQL error, if any.
export const getErrorCode = (error: unknown): string | undefined => {
  if (!isApolloError(error)) return undefined;
  const code = error.graphQLErrors[0]?.extensions?.code;
  return typeof code === "string" ? code : undefined;
};

// Returns a message that is safe and useful to show to shoppers.
export const getErrorMessage = (error: unknown): string => {
  if (isApolloError(error)) {
    if (error.graphQLErrors.length > 0) return error.graphQLErrors[0].message;
    if (error.networkError) {
      return "We couldn't reach the store. Check your connection and try again.";
    }
  }
  return "Something went wrong. Please try again.";
};
