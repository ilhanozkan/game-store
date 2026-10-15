import React from "react";
import { useQuery } from "@apollo/client";
import { MdFavoriteBorder } from "react-icons/md";

import { FAVORITES_QUERY } from "../../queries/Queries";
import { FavoritesData } from "../../types/Types";
import { getErrorMessage } from "../../utils/apolloErrors";
import Loading from "../../components/loading/Loading";
import ProductGrid from "../../components/productGrid/ProductGrid";
import { ButtonLink } from "../../components/ui/Button";
import { PageHeader } from "../../components/ui/Layout";
import { EmptyState, ErrorState } from "../../components/ui/States";

const Favorite = () => {
  const { data, loading, error, refetch } = useQuery<FavoritesData>(
    FAVORITES_QUERY,
    // Favorites change from other pages, so always revalidate.
    { fetchPolicy: "cache-and-network" }
  );

  const favorites = data?.me?.favoriteProducts || [];

  let content;
  if (loading && !data) {
    content = <Loading label="Loading favorites" />;
  } else if (error && !data) {
    content = (
      <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
    );
  } else if (favorites.length === 0) {
    content = (
      <EmptyState
        icon={<MdFavoriteBorder aria-hidden />}
        title="You don't have any favorites yet"
        description="Tap the heart on a product to save it here for later."
        action={<ButtonLink to="/">Discover products</ButtonLink>}
      />
    );
  } else {
    content = <ProductGrid products={favorites} />;
  }

  return (
    <>
      <PageHeader
        title="Favorites"
        subtitle={
          favorites.length > 0
            ? `${favorites.length} saved product${
                favorites.length === 1 ? "" : "s"
              }`
            : undefined
        }
      />
      {content}
    </>
  );
};

export default Favorite;
