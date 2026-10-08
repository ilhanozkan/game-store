import { Link } from "react-router-dom";
import styled, { css } from "styled-components";

import { colors, radii } from "../../styles/theme";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

// Transient ($) props keep styling flags off the DOM element.
export type ButtonStyleProps = {
  $variant?: Variant;
  $size?: Size;
  $block?: boolean;
};

const variants: Record<Variant, ReturnType<typeof css>> = {
  primary: css`
    background-color: ${colors.primary};
    color: #fff;

    &:hover:not(:disabled) {
      background-color: ${colors.primaryHover};
    }
  `,
  secondary: css`
    background-color: transparent;
    border-color: ${colors.border};
    color: ${colors.text};

    &:hover:not(:disabled) {
      border-color: rgba(255, 255, 255, 0.4);
      background-color: rgba(255, 255, 255, 0.04);
    }
  `,
  danger: css`
    background-color: ${colors.dangerSoft};
    color: ${colors.danger};

    &:hover:not(:disabled) {
      background-color: rgba(255, 107, 107, 0.24);
    }
  `,
  ghost: css`
    background-color: transparent;
    color: ${colors.textSoft};
    padding-inline: 0.5rem;

    &:hover:not(:disabled) {
      color: #fff;
    }
  `,
};

const sizes: Record<Size, ReturnType<typeof css>> = {
  sm: css`
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
  `,
  md: css`
    padding: 0.75rem 1.25rem;
    font-size: 1rem;
  `,
  lg: css`
    padding: 0.9375rem 1.75rem;
    font-size: 1.0625rem;
  `,
};

export const buttonStyles = css<ButtonStyleProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid transparent;
  border-radius: ${radii.pill};
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 150ms ease-in, border-color 150ms ease-in,
    color 150ms ease-in;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $size = "md" }) => sizes[$size]}
  ${({ $variant = "primary" }) => variants[$variant]}
  ${({ $block }) =>
    $block &&
    css`
      width: 100%;
    `}
`;

export const Button = styled.button.attrs<ButtonStyleProps>(({ type }) => ({
  type: type || "button",
}))<ButtonStyleProps>`
  ${buttonStyles}
`;

export const ButtonLink = styled(Link)<ButtonStyleProps>`
  ${buttonStyles}
`;
