import React, { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { RegisterInput, useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/apolloErrors";
import safeRedirect from "../../utils/safeRedirect";
import usePageTitle from "../../hooks/usePageTitle";
import { useToast } from "../../components/toast/ToastContext";
import { Button } from "../../components/ui/Button";
import { Alert, Field, Form, Input } from "../../components/ui/Form";
import AuthLayout, { Footnote } from "../auth/AuthLayout";

type Values = RegisterInput & { confirmPassword: string };
type Errors = Partial<Record<keyof Values, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_.]{3,30}$/;

// Mirrors the API's rules so most mistakes are caught before submitting.
export const validate = (values: Values): Errors => {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your name";
  if (!USERNAME_PATTERN.test(values.username.trim())) {
    errors.username =
      "Use 3–30 letters, numbers, dots or underscores (no spaces)";
  }
  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address";
  }
  if (values.password.length < 8) {
    errors.password = "Use at least 8 characters";
  }
  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords don't match";
  }
  return errors;
};

const FIELDS: {
  name: keyof Values;
  label: string;
  type?: string;
  autoComplete: string;
  hint?: string;
}[] = [
  { name: "name", label: "Full name", autoComplete: "name" },
  {
    name: "username",
    label: "Username",
    autoComplete: "username",
    hint: "Letters, numbers, dots and underscores",
  },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
    hint: "At least 8 characters",
  },
  {
    name: "confirmPassword",
    label: "Confirm password",
    type: "password",
    autoComplete: "new-password",
  },
];

const Register = () => {
  usePageTitle("Create account");
  const { user, register } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = safeRedirect(searchParams.get("redirect"));
  const [values, setValues] = useState<Values>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user && !submitting) return <Navigate to={redirect} replace />;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof Values]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setServerError("");
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const created = await register({
        name: values.name.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      showToast({ message: `Welcome to Game Drill, ${created.name}!` });
      navigate(redirect, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Game Drill to save favorites and check out with your store balance."
    >
      <Form onSubmit={handleSubmit} noValidate>
        {serverError && (
          <Alert $tone="error" role="alert">
            {serverError}
          </Alert>
        )}
        {FIELDS.map((field) => {
          const id = `register-${field.name}`;
          const error = errors[field.name];
          let describedBy;
          if (error) describedBy = `${id}-error`;
          else if (field.hint) describedBy = `${id}-hint`;
          return (
            <Field
              key={field.name}
              label={field.label}
              htmlFor={id}
              hint={field.hint}
              error={error}
            >
              <Input
                id={id}
                name={field.name}
                type={field.type || "text"}
                autoComplete={field.autoComplete}
                value={values[field.name]}
                onChange={handleChange}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy}
                required
              />
            </Field>
          );
        })}
        <Button type="submit" $size="lg" $block disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </Form>
      <Footnote>
        Already have an account?{" "}
        <Link to={`/login?redirect=${encodeURIComponent(redirect)}`}>
          Sign in
        </Link>
      </Footnote>
    </AuthLayout>
  );
};

export default Register;
