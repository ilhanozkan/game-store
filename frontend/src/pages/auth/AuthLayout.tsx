import React from "react";
import styled from "styled-components";

import { colors, radii } from "../../styles/theme";

const Card = styled.section`
  width: min(28rem, 100%);
  margin: 1rem auto 0;
  padding: 2.25rem;
  border-radius: ${radii.lg};
  background: ${colors.surface};
`;

const Title = styled.h1`
  font-size: 1.75rem;
`;

const Subtitle = styled.p`
  margin: 0.5rem 0 1.75rem;
  color: ${colors.textMuted};
  line-height: 1.5;
`;

export const Footnote = styled.p`
  margin-top: 1.5rem;
  color: ${colors.textMuted};
  text-align: center;

  a {
    color: ${colors.primary};
    font-weight: 600;
  }
`;

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => (
  <Card aria-labelledby="auth-title">
    <Title id="auth-title">{title}</Title>
    <Subtitle>{subtitle}</Subtitle>
    {children}
  </Card>
);

export default AuthLayout;
