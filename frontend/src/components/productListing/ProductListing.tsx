import React from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@apollo/client";
import { MdOutlineInventory2 } from "react-icons/md";

import { PRODUCTS_QUERY } from "../../queries/Queries";
import { ProductsData, ProductSort } from "../../types/Types";
import { getErrorMessage } from "../../utils/apolloErrors";
import usePageTitle from "../../hooks/usePageTitle";
import ProductGrid from "../productGrid/ProductGrid";
import SortSelect, { parseSort } from "../sortSelect/SortSelect";
import { ProductGridSkeleton } from "../skeleton/Skeleton";
import { PageHeader } from "../ui/Layout";
import { EmptyState, ErrorState } from "../ui/States";
import { Alert } from "../ui/Form";
import { ButtonLink } from "../ui/Button";

// Dims the current results while a new sort order loads.
const Results = styled.div<{ $pending: boolean }>`
  opacity: ${({ $pending }) => ($pending ? 0.55 : 1)};
  transition: opacity 150ms ease-in;
`;

const InlineError = styled(Alert)`
  margin-bottom: 1rem;
`;

type ProductListingProps = {
  title: string;
  description?: string;
  category?: string;
  pageTitle?: string | null;
};

const countLabel = (count: number) =>
  `${count} product${count === 1 ? "" : "s"}`;

// Fetches and shows a titled, sortable grid of products, optionally for one
// category. The sort order lives in the URL (?sort=price_asc) so it can be
// shared and survives reloads.
const ProductListing = ({
  title,
  description = "",
  category = undefined,
  pageTitle = title,
}: ProductListingProps) => {
  usePageTitle(pageTitle);
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = parseSort(searchParams.get("sort"));
  const { data, previousData, loading, error, refetch } =
    useQuery<ProductsData>(PRODUCTS_QUERY, { variables: { category, sort } });

  // Keep showing the current products while a new sort order loads.
  const shown = data || previousData;
  const products = shown?.products || [];
  const subtitle = [description, shown ? countLabel(products.length) : ""]
    .filter(Boolean)
    .join(" · ");

  const handleSort = (next: ProductSort) => {
    const params = new URLSearchParams(searchParams);
    if (next === "FEATURED") params.delete("sort");
    else params.set("sort", next.toLowerCase());
    setSearchParams(params, { replace: true });
  };

  let content;
  if (loading && !shown) {
    content = <ProductGridSkeleton />;
  } else if (error && !shown) {
    content = (
      <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
    );
  } else if (products.length === 0) {
    content = (
      <EmptyState
        icon={<MdOutlineInventory2 aria-hidden />}
        title="No products here yet"
        description="We're restocking this shelf. Check back soon or explore other categories."
        action={<ButtonLink to="/catalog">Browse the catalog</ButtonLink>}
      />
    );
  } else {
    content = <ProductGrid products={products} />;
  }

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          products.length > 1 && (
            <SortSelect value={sort} onChange={handleSort} />
          )
        }
      />
      {error && previousData && !data && (
        <InlineError $tone="error" role="alert">
          {getErrorMessage(error)} Showing the previous results.
        </InlineError>
      )}
      <Results $pending={loading && Boolean(shown)} aria-busy={loading}>
        {content}
      </Results>
    </>
  );
};

export default ProductListing;
