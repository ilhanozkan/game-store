import React, { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/apolloErrors";
import safeRedirect from "../../utils/safeRedirect";
import { Button } from "../../components/ui/Button";
import { Alert, Field, Form, Input } from "../../components/ui/Form";
import AuthLayout, { Footnote } from "../auth/AuthLayout";

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = safeRedirect(searchParams.get("redirect"));
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user && !submitting) return <Navigate to={redirect} replace />;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(identifier.trim(), password);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to save favorites, check out and track your orders."
    >
      <Form onSubmit={handleSubmit} noValidate>
        {error && (
          <Alert $tone="error" role="alert">
            {error}
          </Alert>
        )}
        <Field label="Username or email" htmlFor="login-identifier">
          <Input
            id="login-identifier"
            name="identifier"
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </Field>
        <Field label="Password" htmlFor="login-password">
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <Button
          type="submit"
          $size="lg"
          $block
          disabled={submitting || !identifier.trim() || !password}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
        <Alert $tone="info">
          Exploring the demo? Sign in as <strong>fola</strong> with password{" "}
          <strong>gamestore123</strong>.
        </Alert>
      </Form>
      <Footnote>
        New to Game Drill?{" "}
        <Link to={`/register?redirect=${encodeURIComponent(redirect)}`}>
          Create an account
        </Link>
      </Footnote>
    </AuthLayout>
  );
};

export default Login;
