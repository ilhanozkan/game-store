import React from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import { TiHeartFullOutline } from "react-icons/ti";
import { FiPlus } from "react-icons/fi";

import { maxQuantityFor, useCart } from "../../context/CartContext";
import useFavorite from "../../hooks/useFavorite";
import { useToast } from "../toast/ToastContext";
import formatCurrency from "../../utils/CurrencyFormatter";
import { Product } from "../../types/Types";
import { colors, radii } from "../../styles/theme";
import QuantityStepper from "../quantityStepper/QuantityStepper";
import Rating from "../rating/Rating";

export const LOW_STOCK_THRESHOLD = 3;

const FavoriteButton = styled.button<{ $active: boolean }>`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1;
  display: flex;
  padding: 0.25rem;
  border: none;
  border-radius: 50%;
  background: none;
  cursor: pointer;
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transition: opacity 150ms ease-in, transform 150ms ease-in;

  &:hover {
    transform: scale(1.1);
  }

  /* Touch screens can't hover, so keep the button visible there. */
  @media (hover: none) {
    opacity: 1;
  }
`;

const Container = styled.article`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 1.5rem;
  border-radius: 0.42125rem;
  background: ${colors.surface};
  color: #fff;
  transition: outline 30ms ease-in;

  /* :focus-visible keeps the highlight for keyboard users without leaving
     it stuck on after a mouse click. */
  &:hover,
  &:has(:focus-visible) {
    outline: 0.206875rem solid rgba(255, 255, 255, 0.5);

    ${FavoriteButton} {
      opacity: 1;
    }
  }

  a {
    color: #fff;
    text-decoration: none;
  }
`;

const ImageLink = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 11.25rem;
  margin-top: -2.5rem;
`;

const Image = styled.img<{ $soldOut: boolean }>`
  max-width: 88%;
  max-height: 100%;
  object-fit: contain;
  border-radius: ${radii.sm};

  ${({ $soldOut }) =>
    $soldOut &&
    css`
      filter: grayscale(0.85);
      opacity: 0.6;
    `}
`;

const CardInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 1rem 0;
  text-align: center;
`;

const Title = styled.h3`
  font-size: 1.25rem;

  a:hover {
    text-decoration: underline;
  }
`;

const CategoryLink = styled(Link)`
  color: ${colors.textMuted} !important;
  font-size: 1rem;

  &:hover {
    text-decoration: underline !important;
  }
`;

const Price = styled.p`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${colors.primary};
`;

const StockNote = styled.p<{ $soldOut: boolean }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ $soldOut }) => ($soldOut ? colors.danger : colors.warning)};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.25rem;
  margin-top: auto;
  padding-top: 0.5rem;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.635rem;
  padding: 0;
  border: none;
  background: none;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    color: ${colors.textMuted};
  }
`;

const PlusCircle = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2.125rem;
  height: 2.125rem;
  border: 1px solid currentColor;
  border-radius: 50%;
  font-size: 1rem;
  transition: background-color 75ms ease-in, border-color 75ms ease-in;

  ${AddButton}:hover:not(:disabled) & {
    background-color: ${colors.primary};
    border-color: ${colors.primary};
  }
`;

const ProductCard = ({ product }: { product: Product }) => {
  const { name, slug, category, categorySlug, price, stock, img } = product;
  const id = product._id;
  const { getQuantity, addItem, updateQuantity, openCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorite();
  const showToast = useToast();

  const quantity = getQuantity(id);
  const favorite = isFavorite(id);
  const soldOut = stock <= 0;
  const productUrl = `/product/${slug}`;

  const handleFavorite = async () => {
    try {
      const added = await toggleFavorite(id);
      if (added === null) return;
      showToast({
        message: added
          ? `Saved ${name} to your favorites`
          : `Removed ${name} from your favorites`,
        tone: "info",
      });
    } catch {
      // The optimistic update is rolled back automatically.
      showToast({
        message: "We couldn't update your favorites. Please try again.",
        tone: "error",
      });
    }
  };

  const handleAdd = () => {
    addItem(product);
    showToast({
      message: `Added ${name} to your cart`,
      action: { label: "View cart", onClick: openCart },
    });
  };

  return (
    <Container aria-labelledby={`product-${id}`}>
      <FavoriteButton
        type="button"
        $active={favorite}
        onClick={handleFavorite}
        aria-pressed={favorite}
        aria-label={
          favorite
            ? `Remove ${name} from favorites`
            : `Add ${name} to favorites`
        }
      >
        <TiHeartFullOutline
          size="1.75rem"
          aria-hidden
          fill={favorite ? colors.favorite : "#cfdcff"}
          opacity={favorite ? 1 : 0.4}
        />
      </FavoriteButton>
      <ImageLink to={productUrl} tabIndex={-1} aria-hidden>
        {img && <Image src={img} alt="" loading="lazy" $soldOut={soldOut} />}
      </ImageLink>
      <CardInfo>
        <Title id={`product-${id}`}>
          <Link to={productUrl}>{name}</Link>
        </Title>
        <CategoryLink to={`/products/${categorySlug}`}>{category}</CategoryLink>
        <Rating value={product.rating} count={product.reviewCount} />
        <Price>{formatCurrency(price)}</Price>
        {(soldOut || stock <= LOW_STOCK_THRESHOLD) && (
          <StockNote $soldOut={soldOut}>
            {soldOut ? "Out of stock" : `Only ${stock} left`}
          </StockNote>
        )}
        <Actions>
          {quantity > 0 ? (
            <QuantityStepper
              value={quantity}
              max={maxQuantityFor(stock)}
              onChange={(next) => updateQuantity(id, next)}
              label={name}
            />
          ) : (
            <AddButton type="button" onClick={handleAdd} disabled={soldOut}>
              <PlusCircle aria-hidden>
                <FiPlus />
              </PlusCircle>
              {soldOut ? "Sold out" : "Add to Cart"}
            </AddButton>
          )}
        </Actions>
      </CardInfo>
    </Container>
  );
};

export default ProductCard;
