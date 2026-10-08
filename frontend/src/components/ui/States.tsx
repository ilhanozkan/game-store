import React from "react";
import styled from "styled-components";
import { MdErrorOutline } from "react-icons/md";

import { colors, radii } from "../../styles/theme";
import { Button } from "./Button";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1.5rem;
  border: 1px dashed ${colors.border};
  border-radius: ${radii.md};
  text-align: center;
`;

const IconCircle = styled.div<{ $tone: "neutral" | "error" }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  font-size: 1.75rem;
  color: ${({ $tone }) => ($tone === "error" ? colors.danger : colors.primary)};
  background: ${({ $tone }) =>
    $tone === "error" ? colors.dangerSoft : colors.primarySoft};
`;

const Title = styled.h2`
  font-size: 1.25rem;
`;

const Description = styled.p`
  max-width: 28rem;
  color: ${colors.textMuted};
  line-height: 1.5;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) => (
  <Wrapper>
    {icon && <IconCircle $tone="neutral">{icon}</IconCircle>}
    <Title>{title}</Title>
    {description && <Description>{description}</Description>}
    {action && <Actions>{action}</Actions>}
  </Wrapper>
);

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export const ErrorState = ({
  message = "We couldn't load this right now.",
  onRetry,
}: ErrorStateProps) => (
  <Wrapper role="alert">
    <IconCircle $tone="error">
      <MdErrorOutline aria-hidden />
    </IconCircle>
    <Title>Something went wrong</Title>
    <Description>{message}</Description>
    {onRetry && (
      <Actions>
        <Button $variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      </Actions>
    )}
  </Wrapper>
);
