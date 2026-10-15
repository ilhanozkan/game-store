import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useMutation } from "@apollo/client";
import { BsBag } from "react-icons/bs";
import { FiTrash2 } from "react-icons/fi";

import { maxQuantityFor, useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { CHECKOUT_MUTATION } from "../../queries/Mutations";
import useCartSync from "../../hooks/useCartSync";
import formatCurrency from "../../utils/CurrencyFormatter";
import { getErrorCode, getErrorMessage } from "../../utils/apolloErrors";
import { colors, radii } from "../../styles/theme";
import QuantityStepper from "../../components/quantityStepper/QuantityStepper";
import { Button, ButtonLink } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Form";
import { PageHeader, Panel, PanelTitle } from "../../components/ui/Layout";
import { EmptyState } from "../../components/ui/States";

type PlacedOrder = { reference: string; total: number; itemCount: number };

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(16rem, 22rem);
  align-items: start;
  gap: 2rem;

  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Items = styled.ul`
  list-style: none;
  border-radius: ${radii.md};
  background: ${colors.surface};
`;

const Item = styled.li`
  display: grid;
  grid-template-columns: 5rem minmax(0, 1fr) auto auto auto;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;

  &:not(:last-child) {
    border-bottom: 1px solid ${colors.border};
  }

  @media screen and (max-width: 768px) {
    grid-template-columns: 4rem minmax(0, 1fr) auto;
  }
`;

const Thumb = styled.img`
  width: 5rem;
  height: 5rem;
  object-fit: contain;

  @media screen and (max-width: 768px) {
    width: 4rem;
    height: 4rem;
  }
`;

const Name = styled(Link)`
  display: block;
  margin-bottom: 0.25rem;
  color: #fff;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const UnitPrice = styled.span`
  color: ${colors.textMuted};
  font-size: 0.9375rem;
`;

const LineTotal = styled.span`
  min-width: 6.5rem;
  color: ${colors.primary};
  font-weight: 600;
  text-align: right;
`;

const RemoveButton = styled.button`
  display: flex;
  padding: 0.5rem;
  border: none;
  border-radius: 50%;
  background: none;
  color: ${colors.textMuted};
  font-size: 1.125rem;
  cursor: pointer;

  &:hover {
    color: ${colors.danger};
    background: ${colors.dangerSoft};
  }
`;

const SummaryRow = styled.p<{ $strong?: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.875rem;
  color: ${({ $strong }) => ($strong ? "#fff" : colors.textSoft)};
  font-size: ${({ $strong }) => ($strong ? "1.25rem" : "1rem")};
  font-weight: ${({ $strong }) => ($strong ? 700 : 500)};
`;

const Divider = styled.hr`
  margin: 1.25rem 0;
  border: none;
  border-top: 1px solid ${colors.border};
`;

const CartNotice = styled(Alert)`
  margin-bottom: 1.5rem;
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SummaryActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.25rem;
`;

const Cart = () => {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } =
    useCart();
  const { user } = useAuth();
  const { notice, clearNotice, recheck } = useCartSync(true);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [checkout, { loading, error, reset }] = useMutation<{
    checkout: PlacedOrder;
  }>(CHECKOUT_MUTATION);

  const insufficient = Boolean(user && user.balance < subtotal);

  const handleCheckout = async () => {
    try {
      const { data } = await checkout({
        variables: {
          items: items.map(({ productId, quantity }) => ({
            productId,
            quantity,
          })),
        },
        // Balance comes from `me`; stock and history change too.
        refetchQueries: ["getMe"],
        update: (cache) => {
          items.forEach(({ productId, quantity }) => {
            cache.modify({
              id: cache.identify({ __typename: "Product", _id: productId }),
              fields: {
                stock: (stock: number) => Math.max(0, stock - quantity),
              },
            });
          });
          cache.evict({ id: "ROOT_QUERY", fieldName: "myOrders" });
          cache.evict({ id: "ROOT_QUERY", fieldName: "myTransactions" });
          cache.gc();
        },
      });
      if (data) {
        setPlacedOrder(data.checkout);
        clearNotice();
        clearCart();
      }
    } catch (err) {
      // Shown through `error` below. Stock or prices may have changed, so
      // re-check the cart against the catalog.
      if (getErrorCode(err) === "BAD_USER_INPUT") recheck();
    }
  };

  const confirmation = placedOrder && (
    <Alert $tone="success" role="status">
      Order #{placedOrder.reference} is confirmed: {placedOrder.itemCount} item
      {placedOrder.itemCount === 1 ? "" : "s"} for{" "}
      {formatCurrency(placedOrder.total)}, paid from your balance.{" "}
      <Link to="/profile">View your orders</Link>
    </Alert>
  );

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="Your cart" />
        <Stack>
          {confirmation}
          <EmptyState
            icon={<BsBag aria-hidden />}
            title={
              placedOrder ? "Thanks for your order!" : "Your cart is empty"
            }
            description={
              placedOrder
                ? "We're getting it ready. Keep browsing for more gear while you wait."
                : "Find something you love in the catalog and it will show up here."
            }
            action={<ButtonLink to="/catalog">Browse the catalog</ButtonLink>}
          />
        </Stack>
      </>
    );
  }

  const errorCode = getErrorCode(error);

  return (
    <>
      <PageHeader
        title="Your cart"
        subtitle={`${itemCount} item${itemCount === 1 ? "" : "s"}`}
      />
      {notice && (
        <CartNotice $tone="info" role="status">
          {notice}
        </CartNotice>
      )}
      <Layout>
        <Items aria-label="Items in your cart">
          {items.map((item) => (
            <Item key={item.productId}>
              {item.img ? <Thumb src={item.img} alt="" /> : <span />}
              <div>
                <Name to={`/product/${item.slug}`}>{item.name}</Name>
                <UnitPrice>{formatCurrency(item.price)} each</UnitPrice>
              </div>
              <QuantityStepper
                value={item.quantity}
                max={maxQuantityFor(item.stock)}
                min={1}
                onChange={(q) => {
                  reset();
                  updateQuantity(item.productId, q);
                }}
                label={item.name}
              />
              <LineTotal>
                {formatCurrency(item.price * item.quantity)}
              </LineTotal>
              <RemoveButton
                type="button"
                onClick={() => {
                  reset();
                  removeItem(item.productId);
                }}
                aria-label={`Remove ${item.name} from cart`}
              >
                <FiTrash2 aria-hidden />
              </RemoveButton>
            </Item>
          ))}
        </Items>

        <Panel aria-labelledby="summary-title">
          <PanelTitle id="summary-title">Order summary</PanelTitle>
          <SummaryRow>
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </SummaryRow>
          <SummaryRow>
            <span>Delivery</span>
            <span>Free</span>
          </SummaryRow>
          <Divider />
          <SummaryRow $strong>
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </SummaryRow>
          {user && (
            <>
              <SummaryRow>
                <span>Your balance</span>
                <span>{formatCurrency(user.balance)}</span>
              </SummaryRow>
              {!insufficient && (
                <SummaryRow>
                  <span>Balance after order</span>
                  <span>{formatCurrency(user.balance - subtotal)}</span>
                </SummaryRow>
              )}
            </>
          )}

          <SummaryActions>
            {insufficient && (
              <Alert $tone="error">
                Your balance is{" "}
                {formatCurrency(subtotal - (user?.balance || 0))} short.{" "}
                <Link to="/balance">Top up your balance</Link>
              </Alert>
            )}
            {error && (
              <Alert $tone="error" role="alert">
                {getErrorMessage(error)}
                {errorCode === "INSUFFICIENT_BALANCE" && (
                  <>
                    {" "}
                    <Link to="/balance">Top up your balance</Link>
                  </>
                )}
              </Alert>
            )}
            {user ? (
              <Button
                $size="lg"
                $block
                onClick={handleCheckout}
                disabled={loading || insufficient}
              >
                {loading ? "Placing order…" : `Pay ${formatCurrency(subtotal)}`}
              </Button>
            ) : (
              <ButtonLink to="/login?redirect=%2Fcart" $size="lg" $block>
                Sign in to check out
              </ButtonLink>
            )}
            <Button $variant="ghost" $size="sm" onClick={clearCart}>
              Clear cart
            </Button>
          </SummaryActions>
        </Panel>
      </Layout>
    </>
  );
};

export default Cart;
