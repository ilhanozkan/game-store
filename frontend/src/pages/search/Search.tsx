import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Fuse from "fuse.js";
import { MdOutlineSearchOff } from "react-icons/md";

import { PRODUCTS_QUERY } from "../../queries/Queries";
import { Product, ProductsData } from "../../types/Types";
import { getErrorMessage } from "../../utils/apolloErrors";
import { SEARCH_PARAM } from "../../components/search/Search";
import usePageTitle from "../../hooks/usePageTitle";
import { ProductGridSkeleton } from "../../components/skeleton/Skeleton";
import ProductGrid from "../../components/productGrid/ProductGrid";
import { PageHeader } from "../../components/ui/Layout";
import { EmptyState, ErrorState } from "../../components/ui/States";
import { ButtonLink } from "../../components/ui/Button";

const FUSE_OPTIONS: Fuse.IFuseOptions<Product> = {
  keys: [
    { name: "name", weight: 3 },
    { name: "brand", weight: 2 },
    { name: "category", weight: 1 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
};

const Search = () => {
  const [searchParams] = useSearchParams();
  const term = (searchParams.get(SEARCH_PARAM) || "").trim();
  usePageTitle(term ? `Search results for “${term}”` : "Search");
  const { data, loading, error, refetch } =
    useQuery<ProductsData>(PRODUCTS_QUERY);

  const fuse = useMemo(
    () => new Fuse(data?.products || [], FUSE_OPTIONS),
    [data]
  );
  const results = useMemo(
    () => (term ? fuse.search(term).map((result) => result.item) : []),
    [fuse, term]
  );

  if (loading && !data) return <ProductGridSkeleton label="Searching" />;
  if (error && !data) {
    return (
      <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
    );
  }

  if (!term) {
    return (
      <>
        <PageHeader
          title="Search"
          subtitle="Use the search box above to find products by name, brand or category."
        />
        <ProductGrid products={data?.products || []} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Results for “${term}”`}
        subtitle={`${results.length} product${
          results.length === 1 ? "" : "s"
        } found`}
      />
      {results.length > 0 ? (
        <ProductGrid products={results} />
      ) : (
        <EmptyState
          icon={<MdOutlineSearchOff aria-hidden />}
          title="No products match your search"
          description="Check the spelling or try a more general term, like “mouse” or “headset”."
          action={<ButtonLink to="/catalog">Browse the catalog</ButtonLink>}
        />
      )}
    </>
  );
};

export default Search;
