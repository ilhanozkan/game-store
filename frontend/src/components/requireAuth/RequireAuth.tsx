import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import Loading from "../loading/Loading";
import { EmptyState } from "../ui/States";
import { ButtonLink } from "../ui/Button";

type RequireAuthProps = {
  children: React.ReactElement;
  adminOnly?: boolean;
};

// Sends signed-out visitors to the login page, then back here afterwards.
const RequireAuth = ({ children, adminOnly = false }: RequireAuthProps) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;

  if (!user) {
    const redirect = encodeURIComponent(
      `${location.pathname}${location.search}`
    );
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <EmptyState
        title="Admins only"
        description="You need an admin account to view this page."
        action={<ButtonLink to="/">Back to the store</ButtonLink>}
      />
    );
  }

  return children;
};

export default RequireAuth;
