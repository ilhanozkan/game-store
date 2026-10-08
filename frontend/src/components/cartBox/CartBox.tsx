import React, { useRef } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { IoClose } from "react-icons/io5";
import { BsBag } from "react-icons/bs";

import { maxQuantityFor, useCart } from "../../context/CartContext";
import useDialog from "../../hooks/useDialog";
import useCartSync from "../../hooks/useCartSync";
import formatCurrency from "../../utils/CurrencyFormatter";
import { colors, radii } from "../../styles/theme";
import { Button, ButtonLink } from "../ui/Button";
import { Alert } from "../ui/Form";
import QuantityStepper from "../quantityStepper/QuantityStepper";

// id of the header button that opens the cart.
export const CART_BUTTON_ID = "cart-button";

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 45;
  background: rgba(0, 0, 0, 0.6);
  animation: cart-fade 200ms ease-out;

  @keyframes cart-fade {
    from {
      opacity: 0;
    }
  }
`;

const Container = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  z-index: 46;
  display: flex;
  flex-direction: column;
  width: min(24rem, 100vw);
  height: 100vh;
  height: 100dvh;
  background-color: ${colors.background};
  box-shadow: -1rem 0 2rem rgba(0, 0, 0, 0.4);
  animation: cart-slide 300ms ease-out;

  @keyframes cart-slide {
    from {
      transform: translateX(100%);
    }

    to {
      transform: translateX(0);
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid ${colors.border};
`;

const Title = styled.h2`
  font-size: 1.25rem;
`;

const CloseButton = styled.button`
  display: flex;
  padding: 0.25rem;
  border: none;
  border-radius: 50%;
  background: none;
  color: ${colors.textSoft};
  font-size: 1.5rem;
  cursor: pointer;

  &:hover {
    color: #fff;
  }
`;

const DrawerNotice = styled(Alert)`
  margin: 1rem 1.5rem 0;
  font-size: 0.875rem;
`;

const Items = styled.ul`
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 1.5rem;
  list-style: none;
`;

const Item = styled.li`
  display: grid;
  grid-template-columns: 4rem 1fr;
  gap: 1rem;
  padding: 1rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${colors.border};
  }
`;

const Thumb = styled.img`
  width: 4rem;
  height: 4rem;
  padding: 0.25rem;
  border-radius: ${radii.sm};
  background: ${colors.surface};
  object-fit: contain;
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  a {
    color: #fff;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const ItemPrice = styled.span`
  color: ${colors.primary};
  font-weight: 600;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid ${colors.border};
`;

const Total = styled.p`
  display: flex;
  justify-content: space-between;
  font-size: 1.125rem;
  font-weight: 600;
`;

const Empty = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: ${colors.textMuted};
  text-align: center;

  svg {
    font-size: 2.5rem;
  }
`;

const Panel = ({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, true, onClose, {
    // If the opener is gone (e.g. a toast's "View cart"), return to the bag.
    returnFocusTo: () => document.getElementById(CART_BUTTON_ID),
  });

  return (
    <>
      <Backdrop onClick={onClose} aria-hidden />
      <Container
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        tabIndex={-1}
      >
        {children}
      </Container>
    </>
  );
};

const CartBox = () => {
  const {
    items,
    itemCount,
    subtotal,
    updateQuantity,
    clearCart,
    isOpen,
    closeCart,
  } = useCart();
  const { notice } = useCartSync(isOpen);

  if (!isOpen) return null;

  return (
    <Panel onClose={closeCart}>
      <Header>
        <Title id="cart-title">
          Your cart {itemCount > 0 && `(${itemCount})`}
        </Title>
        <CloseButton type="button" onClick={closeCart} aria-label="Close cart">
          <IoClose aria-hidden />
        </CloseButton>
      </Header>

      {notice && (
        <DrawerNotice $tone="info" role="status">
          {notice}
        </DrawerNotice>
      )}
      {items.length === 0 ? (
        <Empty>
          <BsBag aria-hidden />
          <p>Your cart is empty.</p>
          <ButtonLink to="/catalog" $variant="secondary" onClick={closeCart}>
            Browse the catalog
          </ButtonLink>
        </Empty>
      ) : (
        <>
          <Items>
            {items.map((item) => (
              <Item key={item.productId}>
                {item.img ? <Thumb src={item.img} alt="" /> : <span />}
                <ItemInfo>
                  <Link to={`/product/${item.slug}`} onClick={closeCart}>
                    {item.name}
                  </Link>
                  <ItemRow>
                    <QuantityStepper
                      compact
                      value={item.quantity}
                      max={maxQuantityFor(item.stock)}
                      onChange={(q) => updateQuantity(item.productId, q)}
                      label={item.name}
                    />
                    <ItemPrice>
                      {formatCurrency(item.price * item.quantity)}
                    </ItemPrice>
                  </ItemRow>
                </ItemInfo>
              </Item>
            ))}
          </Items>
          <Footer>
            <Total>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </Total>
            <ButtonLink to="/cart" $block onClick={closeCart}>
              View cart & checkout
            </ButtonLink>
            <Button $variant="ghost" $size="sm" onClick={clearCart}>
              Clear cart
            </Button>
          </Footer>
        </>
      )}
    </Panel>
  );
};

export default CartBox;
