import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useMutation, useQuery } from "@apollo/client";
import { MdOutlineReceiptLong } from "react-icons/md";

import { useAuth } from "../../context/AuthContext";
import { MY_ORDERS_QUERY } from "../../queries/Queries";
import { UPDATE_PROFILE_MUTATION } from "../../queries/Mutations";
import { OrdersData } from "../../types/Types";
import formatCurrency from "../../utils/CurrencyFormatter";
import formatDate from "../../utils/formatDate";
import { getErrorMessage } from "../../utils/apolloErrors";
import { colors, radii } from "../../styles/theme";
import Avatar from "../../components/avatar/Avatar";
import Loading from "../../components/loading/Loading";
import { Button, ButtonLink } from "../../components/ui/Button";
import { Alert, Field, Form, Input } from "../../components/ui/Form";
import { PageHeader, Panel, PanelTitle } from "../../components/ui/Layout";
import { EmptyState, ErrorState } from "../../components/ui/States";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
`;

const Name = styled.h2`
  font-size: 1.5rem;
`;

const Detail = styled.p`
  color: ${colors.textMuted};
  line-height: 1.6;
`;

const Badge = styled.span`
  display: inline-block;
  margin-top: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: ${radii.pill};
  background: ${colors.primarySoft};
  color: ${colors.primary};
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const Stats = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  div {
    padding: 1rem;
    border-radius: ${radii.sm};
    background: rgba(255, 255, 255, 0.04);
  }

  dt {
    color: ${colors.textMuted};
    font-size: 0.875rem;
  }

  dd {
    margin-top: 0.375rem;
    font-size: 1.125rem;
    font-weight: 700;

    a {
      color: inherit;
      text-decoration: none;
    }
  }
`;

const Orders = styled.ul`
  list-style: none;
`;

const OrderRow = styled.li`
  padding: 1.25rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${colors.border};
  }
`;

const OrderHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem 1.5rem;
  margin-bottom: 0.75rem;

  strong {
    font-size: 1.0625rem;
  }
`;

const OrderItems = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem 0.375rem 0.375rem;
    border-radius: ${radii.sm};
    background: rgba(255, 255, 255, 0.04);
    color: ${colors.textSoft};
    font-size: 0.9375rem;
  }

  img {
    width: 2rem;
    height: 2rem;
    object-fit: contain;
  }
`;

const ProfileForm = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [img, setImg] = useState(user?.img || "");
  const [saved, setSaved] = useState(false);
  const [updateProfile, { loading, error }] = useMutation(
    UPDATE_PROFILE_MUTATION
  );

  useEffect(() => {
    setSaved(false);
  }, [name, email, img]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await updateProfile({
        variables: {
          input: { name: name.trim(), email: email.trim(), img: img.trim() },
        },
      });
      setSaved(true);
    } catch {
      // Shown through `error` below.
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && (
        <Alert $tone="error" role="alert">
          {getErrorMessage(error)}
        </Alert>
      )}
      {saved && (
        <Alert $tone="success" role="status">
          Your profile has been updated.
        </Alert>
      )}
      <Field label="Full name" htmlFor="profile-name">
        <Input
          id="profile-name"
          value={name}
          autoComplete="name"
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Field>
      <Field label="Email" htmlFor="profile-email">
        <Input
          id="profile-email"
          type="email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Field>
      <Field
        label="Avatar URL"
        htmlFor="profile-img"
        hint="Link to a square image. Leave empty to show your initials."
      >
        <Input
          id="profile-img"
          type="url"
          value={img}
          placeholder="https://"
          onChange={(e) => setImg(e.target.value)}
          aria-describedby="profile-img-hint"
        />
      </Field>
      <div>
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </Form>
  );
};

const OrderHistory = () => {
  const { data, loading, error, refetch } = useQuery<OrdersData>(
    MY_ORDERS_QUERY,
    { fetchPolicy: "cache-and-network" }
  );

  if (loading && !data) return <Loading label="Loading orders" />;
  if (error && !data) {
    return (
      <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
    );
  }
  if (!data?.myOrders.length) {
    return (
      <EmptyState
        icon={<MdOutlineReceiptLong aria-hidden />}
        title="No orders yet"
        description="When you check out, your orders will appear here."
        action={<ButtonLink to="/catalog">Start shopping</ButtonLink>}
      />
    );
  }

  return (
    <Orders>
      {data.myOrders.map((order) => (
        <OrderRow key={order._id}>
          <OrderHeader>
            <strong>Order #{order.reference}</strong>
            <Detail>
              {formatDate(order.createdAt)} · {order.itemCount} item
              {order.itemCount === 1 ? "" : "s"} · {formatCurrency(order.total)}
            </Detail>
          </OrderHeader>
          <OrderItems>
            {order.items.map((item) => (
              <li key={item.productId}>
                {item.img && <img src={item.img} alt="" />}
                {item.quantity} × {item.name}
              </li>
            ))}
          </OrderItems>
        </OrderRow>
      ))}
    </Orders>
  );
};

const Profile = () => {
  const { user, logout } = useAuth();
  const { data } = useQuery<OrdersData>(MY_ORDERS_QUERY);
  if (!user) return null;

  return (
    <>
      <PageHeader
        title="Your profile"
        actions={
          <Button $variant="secondary" onClick={logout}>
            Sign out
          </Button>
        }
      />
      <Grid>
        <Panel aria-label="Account">
          <Identity>
            <Avatar name={user.name} src={user.img} size={4.5} />
            <div>
              <Name>{user.name}</Name>
              <Detail>
                @{user.username} · {user.email}
              </Detail>
              <Detail>Member since {formatDate(user.createdAt)}</Detail>
              {user.role === "ADMIN" && <Badge>Admin</Badge>}
            </div>
          </Identity>
          <Stats>
            <div>
              <dt>Balance</dt>
              <dd>
                <Link to="/balance">{formatCurrency(user.balance)}</Link>
              </dd>
            </div>
            <div>
              <dt>Orders</dt>
              <dd>{data ? data.myOrders.length : "–"}</dd>
            </div>
            <div>
              <dt>Favorites</dt>
              <dd>
                <Link to="/favorite">{user.favorites.length}</Link>
              </dd>
            </div>
          </Stats>
        </Panel>
        <Panel aria-labelledby="edit-profile-title">
          <PanelTitle id="edit-profile-title">Edit profile</PanelTitle>
          <ProfileForm />
        </Panel>
      </Grid>
      <Panel aria-labelledby="orders-title">
        <PanelTitle id="orders-title">Order history</PanelTitle>
        <OrderHistory />
      </Panel>
    </>
  );
};

export default Profile;
