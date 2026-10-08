import React from "react";
import styled, { css } from "styled-components";

import { colors, radii } from "../../styles/theme";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${colors.textSoft};
  font-size: 0.9375rem;
  font-weight: 600;
`;

const Hint = styled.p`
  color: ${colors.textMuted};
  font-size: 0.8125rem;
`;

const FieldError = styled.p`
  color: ${colors.danger};
  font-size: 0.8125rem;
`;

type FieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

export const Field = ({
  label,
  htmlFor,
  hint,
  error,
  children,
}: FieldProps) => (
  <FieldWrapper>
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
    {error ? (
      <FieldError id={`${htmlFor}-error`}>{error}</FieldError>
    ) : (
      hint && <Hint id={`${htmlFor}-hint`}>{hint}</Hint>
    )}
  </FieldWrapper>
);

const controlStyles = css`
  width: 100%;
  padding: 0.75rem 0.875rem;
  border-radius: ${radii.sm};
  border: 1px solid ${colors.border};
  background: rgba(168, 168, 168, 0.12);
  color: ${colors.text};
  font-size: 1rem;
  transition: border-color 150ms ease-in;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }

  &[aria-invalid="true"] {
    border-color: ${colors.danger};
  }
`;

export const Input = styled.input`
  ${controlStyles}
`;

export const Select = styled.select`
  ${controlStyles}

  option {
    background: ${colors.surface};
  }
`;

export const TextArea = styled.textarea`
  ${controlStyles}
  min-height: 7rem;
  resize: vertical;
`;

type Tone = "error" | "success" | "info";

const tones: Record<Tone, ReturnType<typeof css>> = {
  error: css`
    background: ${colors.dangerSoft};
    border-color: rgba(255, 107, 107, 0.4);
  `,
  success: css`
    background: ${colors.successSoft};
    border-color: rgba(62, 207, 142, 0.4);
  `,
  info: css`
    background: ${colors.primarySoft};
    border-color: rgba(97, 141, 255, 0.4);
  `,
};

export const Alert = styled.div<{ $tone?: Tone }>`
  padding: 0.875rem 1rem;
  border-radius: ${radii.sm};
  border: 1px solid transparent;
  color: ${colors.text};
  line-height: 1.5;

  ${({ $tone = "info" }) => tones[$tone]}

  a {
    color: inherit;
    font-weight: 600;
  }
`;
