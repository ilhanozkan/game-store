import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { MdOutlineCategory } from "react-icons/md";

import { CATEGORY_QUERY } from "../../queries/Queries";
import { CategoryData } from "../../types/Types";
import { getErrorMessage } from "../../utils/apolloErrors";
import usePageTitle from "../../hooks/usePageTitle";
import { ProductGridSkeleton } from "../../components/skeleton/Skeleton";
import ProductListing from "../../components/productListing/ProductListing";
import { EmptyState, ErrorState } from "../../components/ui/States";
import { ButtonLink } from "../../components/ui/Button";

const Category = () => {
  const { category: slug = "" } = useParams();
  const { data, loading, error, refetch } = useQuery<CategoryData>(
    CATEGORY_QUERY,
    { variables: { slug } }
  );

  // ProductListing titles the page once the category has loaded.
  let title: string | null | undefined;
  if (loading && !data) title = null;
  else if (error && !data) title = "Something went wrong";
  else if (!data?.category) title = "Category not found";
  usePageTitle(title);

  if (loading && !data) return <ProductGridSkeleton />;
  if (error && !data) {
    return (
      <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
    );
  }

  if (!data?.category) {
    return (
      <EmptyState
        icon={<MdOutlineCategory aria-hidden />}
        title="Category not found"
        description="This category doesn't exist or has moved."
        action={<ButtonLink to="/catalog">Browse the catalog</ButtonLink>}
      />
    );
  }

  return (
    <ProductListing
      title={data.category.name}
      description={data.category.description}
      category={data.category.slug}
    />
  );
};

export default Category;
