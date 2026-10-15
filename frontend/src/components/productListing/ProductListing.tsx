import React from "react";
import { useQuery } from "@apollo/client";
import { MdOutlineInventory2 } from "react-icons/md";

import { PRODUCTS_QUERY } from "../../queries/Queries";
import { ProductsData } from "../../types/Types";
import { getErrorMessage } from "../../utils/apolloErrors";
import Loading from "../loading/Loading";
import ProductGrid from "../productGrid/ProductGrid";
import { PageHeader } from "../ui/Layout";
import { EmptyState, ErrorState } from "../ui/States";
import { ButtonLink } from "../ui/Button";

type ProductListingProps = {
  title: string;
  description?: string;
  category?: string;
};

const countLabel = (count: number) =>
  `${count} product${count === 1 ? "" : "s"}`;

// Fetches and shows a titled grid of products, optionally for one category.
const ProductListing = ({
  title,
  description = "",
  category = undefined,
}: ProductListingProps) => {
  const { data, loading, error, refetch } = useQuery<ProductsData>(
    PRODUCTS_QUERY,
    { variables: { category } }
  );

  const products = data?.products || [];
  const subtitle = [description, data ? countLabel(products.length) : ""]
    .filter(Boolean)
    .join(" · ");

  let content;
  if (loading && !data) {
    content = <Loading label="Loading products" />;
  } else if (error && !data) {
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
      <PageHeader title={title} subtitle={subtitle} />
      {content}
    </>
  );
};

export default ProductListing;
