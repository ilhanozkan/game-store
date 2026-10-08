import { useCallback } from "react";
import { Reference, useMutation } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { TOGGLE_FAVORITE_MUTATION } from "../queries/Mutations";

/**
 * Reads and toggles the signed-in user's favorites. Signed-out visitors are
 * sent to the login page and brought back afterwards.
 */
const useFavorite = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mutate] = useMutation(TOGGLE_FAVORITE_MUTATION);

  const isFavorite = useCallback(
    (productId: string) => Boolean(user?.favorites.includes(productId)),
    [user]
  );

  // Resolves to the new favorite state, or null when sign-in is required.
  const toggleFavorite = useCallback(
    async (productId: string): Promise<boolean | null> => {
      if (!user) {
        const redirect = encodeURIComponent(
          `${location.pathname}${location.search}`
        );
        navigate(`/login?redirect=${redirect}`);
        return null;
      }

      const adding = !user.favorites.includes(productId);
      const favorites = adding
        ? [...user.favorites, productId]
        : user.favorites.filter((id) => id !== productId);

      await mutate({
        variables: { productId },
        optimisticResponse: {
          toggleFavorite: { __typename: "User", _id: user._id, favorites },
        },
        // Keep the cached favorites list (shown on the favorites page) in
        // step: drop removed products right away, and refetch it after an
        // addition.
        update: (cache) => {
          const id = cache.identify({ __typename: "User", _id: user._id });
          if (adding) {
            cache.evict({ id, fieldName: "favoriteProducts" });
            return;
          }
          cache.modify({
            id,
            fields: {
              favoriteProducts: (refs: readonly Reference[], { readField }) =>
                refs.filter((ref) => readField("_id", ref) !== productId),
            },
          });
        },
      });
      return adding;
    },
    [user, mutate, navigate, location]
  );

  return { isFavorite, toggleFavorite };
};

export default useFavorite;
