import { useCallback } from "react";
import { useMutation } from "@apollo/client";
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
  const [mutate] = useMutation(TOGGLE_FAVORITE_MUTATION, {
    // Keeps the favorites page in sync when it is on screen.
    refetchQueries: ["getFavorites"],
  });

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
      });
      return adding;
    },
    [user, mutate, navigate, location]
  );

  return { isFavorite, toggleFavorite };
};

export default useFavorite;
