import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ApolloCache,
  useApolloClient,
  useMutation,
  useQuery,
} from "@apollo/client";

import { setUnauthenticatedHandler } from "../apollo/client";
import { ME_QUERY } from "../queries/Queries";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "../queries/Mutations";
import { MeData, User } from "../types/Types";
import { getToken, setToken } from "../utils/storage";

type AuthPayload = { token: string; user: User };

export type RegisterInput = {
  name: string;
  username: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  user: User | null;
  // True while a stored session is being restored on page load.
  loading: boolean;
  isAdmin: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Removes everything cached for the current user so the next user (or a
// signed-out visitor) never sees it. The public catalog stays cached.
const clearUserData = (cache: ApolloCache<unknown>) => {
  ["me", "myOrders", "myTransactions"].forEach((fieldName) =>
    cache.evict({ id: "ROOT_QUERY", fieldName })
  );
  cache.gc();
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const client = useApolloClient();
  const [token, setTokenState] = useState(getToken);
  const { data, loading } = useQuery<MeData>(ME_QUERY, { skip: !token });
  const [loginMutation] = useMutation<{ login: AuthPayload }>(LOGIN_MUTATION);
  const [registerMutation] = useMutation<{ register: AuthPayload }>(
    REGISTER_MUTATION
  );

  const endSession = useCallback(() => {
    setToken(null);
    setTokenState(null);
    clearUserData(client.cache);
  }, [client]);

  // The API answers `me: null` for tokens it no longer accepts (expired, or
  // the account was removed), so drop them.
  useEffect(() => {
    if (token && !loading && data && data.me === null) endSession();
  }, [token, loading, data, endSession]);

  // ...and protected operations answer UNAUTHENTICATED once a token expires
  // while the app is open.
  useEffect(() => {
    setUnauthenticatedHandler(endSession);
    return () => setUnauthenticatedHandler(null);
  }, [endSession]);

  const startSession = useCallback(
    ({ token: newToken, user }: AuthPayload) => {
      clearUserData(client.cache);
      setToken(newToken);
      client.writeQuery<MeData>({ query: ME_QUERY, data: { me: user } });
      setTokenState(newToken);
      return user;
    },
    [client]
  );

  const login = useCallback(
    async (identifier: string, password: string) => {
      const result = await loginMutation({
        variables: { input: { identifier, password } },
      });
      if (!result.data) throw new Error("Login failed");
      return startSession(result.data.login);
    },
    [loginMutation, startSession]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await registerMutation({ variables: { input } });
      if (!result.data) throw new Error("Registration failed");
      return startSession(result.data.register);
    },
    [registerMutation, startSession]
  );

  const user = token ? data?.me ?? null : null;

  const value = useMemo(
    () => ({
      user,
      loading: Boolean(token) && loading && !data,
      isAdmin: user?.role === "ADMIN",
      login,
      register,
      logout: endSession,
    }),
    [user, token, loading, data, login, register, endSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
};
