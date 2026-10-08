import React, { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@apollo/client";
import { IoMdNotificationsOutline } from "react-icons/io";
import { MdOutlineReceiptLong } from "react-icons/md";

import { useAuth } from "../../context/AuthContext";
import { MY_ORDERS_QUERY } from "../../queries/Queries";
import { OrdersData } from "../../types/Types";
import formatCurrency from "../../utils/CurrencyFormatter";
import formatDate from "../../utils/formatDate";
import { colors, radii } from "../../styles/theme";

const Wrapper = styled.div`
  position: relative;
`;

const Trigger = styled.button`
  display: flex;
  padding: 0.25rem;
  border: none;
  border-radius: 50%;
  background: none;
  color: #fff;
  cursor: pointer;
`;

const Panel = styled.div`
  position: absolute;
  top: calc(100% + 0.75rem);
  right: -0.5rem;
  z-index: 15;
  width: min(22rem, calc(100vw - 2rem));
  padding: 1rem;
  border: 1px solid ${colors.border};
  border-radius: ${radii.md};
  background: #262628;
  box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.5);
`;

const Title = styled.h2`
  margin-bottom: 0.75rem;
  font-size: 1rem;
`;

const List = styled.ul`
  list-style: none;
`;

const Entry = styled.li`
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${colors.border};
  }

  svg {
    flex-shrink: 0;
    margin-top: 0.125rem;
    color: ${colors.success};
    font-size: 1.25rem;
  }
`;

const Muted = styled.p`
  color: ${colors.textMuted};
  font-size: 0.875rem;
  line-height: 1.5;

  a {
    color: ${colors.primary};
    font-weight: 600;
  }
`;

const Footer = styled.div`
  margin-top: 0.5rem;
  text-align: right;

  a {
    color: ${colors.primary};
    font-size: 0.875rem;
    font-weight: 600;
  }
`;

const OrderUpdates = () => {
  const { data, loading } = useQuery<OrdersData>(MY_ORDERS_QUERY, {
    fetchPolicy: "cache-and-network",
  });
  const orders = (data?.myOrders || []).slice(0, 3);

  if (loading && !data) return <Muted>Loading…</Muted>;
  if (orders.length === 0) {
    return <Muted>No notifications yet. Order updates will appear here.</Muted>;
  }

  return (
    <>
      <List>
        {orders.map((order) => (
          <Entry key={order._id}>
            <MdOutlineReceiptLong aria-hidden />
            <div>
              <p>Order #{order.reference} is confirmed</p>
              <Muted>
                {order.itemCount} item{order.itemCount === 1 ? "" : "s"} ·{" "}
                {formatCurrency(order.total)} · {formatDate(order.createdAt)}
              </Muted>
            </div>
          </Entry>
        ))}
      </List>
      <Footer>
        <Link to="/profile">View all orders</Link>
      </Footer>
    </>
  );
};

const Notifications = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointer = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <Wrapper ref={wrapperRef}>
      <Trigger
        ref={triggerRef}
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <IoMdNotificationsOutline size="1.75rem" aria-hidden />
      </Trigger>
      {open && (
        <Panel id={panelId} role="region" aria-label="Notifications">
          <Title>Notifications</Title>
          {user ? (
            <OrderUpdates />
          ) : (
            <Muted>
              <Link to="/login">Sign in</Link> to get updates about your orders.
            </Muted>
          )}
        </Panel>
      )}
    </Wrapper>
  );
};

export default Notifications;
