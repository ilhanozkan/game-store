import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@apollo/client";
import { TiHeartFullOutline } from "react-icons/ti";
import { MdOutlineSearchOff } from "react-icons/md";

import { PRODUCT_QUERY, PRODUCTS_QUERY } from "../../queries/Queries";
import { ProductData, ProductsData } from "../../types/Types";
import { maxQuantityFor, useCart } from "../../context/CartContext";
import useFavorite from "../../hooks/useFavorite";
import usePageTitle from "../../hooks/usePageTitle";
import { useToast } from "../../components/toast/ToastContext";
import { ProductDetailSkeleton } from "../../components/skeleton/Skeleton";
import formatCurrency from "../../utils/CurrencyFormatter";
import { getErrorMessage } from "../../utils/apolloErrors";
import { colors, radii } from "../../styles/theme";
import Rating from "../../components/rating/Rating";
import QuantityStepper from "../../components/quantityStepper/QuantityStepper";
import ProductGrid from "../../components/productGrid/ProductGrid";
import { LOW_STOCK_THRESHOLD } from "../../components/productCard/ProductCard";
import { Button, ButtonLink } from "../../components/ui/Button";
import { EmptyState, ErrorState } from "../../components/ui/States";
import { Panel, PanelTitle } from "../../components/ui/Layout";

const Breadcrumbs = styled.nav`
  margin-bottom: 1.5rem;
  color: ${colors.textMuted};
  font-size: 0.9375rem;

  ol {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    list-style: none;
  }

  li:not(:last-child)::after {
    content: "/";
    margin-left: 0.5rem;
  }

  a {
    color: ${colors.textSoft};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: 2.5rem;
  margin-bottom: 2.5rem;
`;

const ImagePanel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 22rem;
  padding: 2rem;
  border-radius: ${radii.md};
  background: ${colors.surface};
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 22rem;
  object-fit: contain;
  border-radius: ${radii.sm};
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Meta = styled.p`
  color: ${colors.textMuted};

  a {
    color: ${colors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Name = styled.h1`
  font-size: 2rem;
  line-height: 1.2;
`;

const Price = styled.p`
  color: ${colors.primary};
  font-size: 1.75rem;
  font-weight: 700;
`;

const Stock = styled.p<{ $tone: "ok" | "low" | "out" }>`
  font-weight: 600;
  color: ${({ $tone }) => {
    if ($tone === "out") return colors.danger;
    if ($tone === "low") return colors.warning;
    return colors.success;
  }};
`;

const Description = styled.p`
  color: ${colors.textSoft};
  line-height: 1.7;
`;

const Purchase = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const InCart = styled.p`
  color: ${colors.textMuted};

  a {
    color: ${colors.primary};
  }
`;

const Specs = styled.dl`
  display: grid;
  grid-template-columns: minmax(8rem, max-content) 1fr;

  dt,
  dd {
    padding: 0.875rem 0;
    border-bottom: 1px solid ${colors.border};
  }

  dt {
    padding-right: 2rem;
    color: ${colors.textMuted};
  }
`;

const RelatedTitle = styled.h2`
  margin-top: 3rem;
  font-size: 1.5rem;
`;

const stockStatus = (stock: number) => {
  if (stock <= 0) return { tone: "out" as const, label: "Out of stock" };
  if (stock <= LOW_STOCK_THRESHOLD) {
    return { tone: "low" as const, label: `Only ${stock} left in stock` };
  }
  return { tone: "ok" as const, label: "In stock" };
};

const ProductDetail = () => {
  const { slug = "" } = useParams();
  const { data, loading, error, refetch } = useQuery<ProductData>(
    PRODUCT_QUERY,
    { variables: { id: slug } }
  );
  const product = data?.product;
  const { data: related } = useQuery<ProductsData>(PRODUCTS_QUERY, {
    variables: { category: product?.categorySlug },
    skip: !product,
  });
  const { getQuantity, addItem, openCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorite();
  const showToast = useToast();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => setQuantity(1), [slug]);
  usePageTitle(data ? product?.name || "Product not found" : undefined);

  if (loading && !data) return <ProductDetailSkeleton />;
  if (error && !data) {
    return (
      <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
    );
  }
  if (!product) {
    return (
      <EmptyState
        icon={<MdOutlineSearchOff aria-hidden />}
        title="Product not found"
        description="It may have been removed from the store."
        action={<ButtonLink to="/catalog">Browse the catalog</ButtonLink>}
      />
    );
  }

  const inCart = getQuantity(product._id);
  const canAdd = maxQuantityFor(product.stock) - inCart;
  const status = stockStatus(product.stock);
  const favorite = isFavorite(product._id);
  const relatedProducts = (related?.products || [])
    .filter((p) => p._id !== product._id)
    .slice(0, 4);

  const handleAdd = () => {
    const added = Math.min(quantity, canAdd);
    addItem(product, added);
    setQuantity(1);
    showToast({
      message: `Added ${added > 1 ? `${added} × ` : ""}${
        product.name
      } to your cart`,
      action: { label: "View cart", onClick: openCart },
    });
  };

  const handleFavorite = async () => {
    try {
      const nowFavorite = await toggleFavorite(product._id);
      if (nowFavorite === null) return;
      showToast({
        message: nowFavorite
          ? `Saved ${product.name} to your favorites`
          : `Removed ${product.name} from your favorites`,
        tone: "info",
      });
    } catch {
      showToast({
        message: "We couldn't update your favorites. Please try again.",
        tone: "error",
      });
    }
  };

  return (
    <>
      <Breadcrumbs aria-label="Breadcrumb">
        <ol>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to={`/products/${product.categorySlug}`}>
              {product.category}
            </Link>
          </li>
          <li aria-current="page">{product.name}</li>
        </ol>
      </Breadcrumbs>

      <Layout>
        <ImagePanel>
          {product.img && <Image src={product.img} alt={product.name} />}
        </ImagePanel>
        <Info>
          <Meta>
            <Link to={`/products/${product.categorySlug}`}>
              {product.category}
            </Link>
            {product.brand && ` · ${product.brand}`}
          </Meta>
          <Name>{product.name}</Name>
          <Rating value={product.rating} count={product.reviewCount} />
          <Price>{formatCurrency(product.price)}</Price>
          <Stock $tone={status.tone}>{status.label}</Stock>
          <Description>{product.description}</Description>
          <Purchase>
            {canAdd > 0 && (
              <QuantityStepper
                value={Math.min(quantity, canAdd)}
                min={1}
                max={canAdd}
                onChange={setQuantity}
                label={product.name}
              />
            )}
            <Button $size="lg" onClick={handleAdd} disabled={canAdd <= 0}>
              {product.stock <= 0 ? "Sold out" : "Add to cart"}
            </Button>
            <Button
              $variant="secondary"
              $size="lg"
              aria-pressed={favorite}
              onClick={handleFavorite}
            >
              <TiHeartFullOutline
                aria-hidden
                color={favorite ? colors.favorite : undefined}
              />
              {favorite ? "Saved" : "Save"}
            </Button>
          </Purchase>
          {inCart > 0 && (
            <InCart>
              {inCart} in your cart · <Link to="/cart">View cart</Link>
            </InCart>
          )}
        </Info>
      </Layout>

      {product.specs.length > 0 && (
        <Panel aria-labelledby="specs-title">
          <PanelTitle id="specs-title">Specifications</PanelTitle>
          <Specs>
            {product.specs.map((spec) => (
              <React.Fragment key={spec.label}>
                <dt>{spec.label}</dt>
                <dd>{spec.value}</dd>
              </React.Fragment>
            ))}
          </Specs>
        </Panel>
      )}

      {relatedProducts.length > 0 && (
        <section aria-labelledby="related-title">
          <RelatedTitle id="related-title">
            More in {product.category}
          </RelatedTitle>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </>
  );
};

export default ProductDetail;
