import React from "react";
import styled from "styled-components";
import { FiMinus, FiPlus } from "react-icons/fi";

import { colors } from "../../styles/theme";

const Wrapper = styled.div<{ $compact: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ $compact }) => ($compact ? "0.5rem" : "0.875rem")};
`;

const StepButton = styled.button<{ $compact: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ $compact }) => ($compact ? "1.75rem" : "2.125rem")};
  height: ${({ $compact }) => ($compact ? "1.75rem" : "2.125rem")};
  border: 1px solid #fff;
  border-radius: 50%;
  background: none;
  color: #fff;
  font-size: ${({ $compact }) => ($compact ? "0.875rem" : "1rem")};
  cursor: pointer;
  transition: background-color 75ms ease-in;

  &:hover:not(:disabled) {
    background-color: ${colors.primary};
    border-color: ${colors.primary};
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const Value = styled.span`
  min-width: 1.5rem;
  text-align: center;
  font-weight: 600;
`;

type QuantityStepperProps = {
  value: number;
  max: number;
  onChange: (quantity: number) => void;
  label: string;
  compact?: boolean;
  min?: number;
};

const QuantityStepper = ({
  value,
  max,
  onChange,
  label,
  compact = false,
  min = 0,
}: QuantityStepperProps) => (
  <Wrapper $compact={compact} role="group" aria-label={`Quantity of ${label}`}>
    <StepButton
      type="button"
      $compact={compact}
      onClick={() => onChange(value - 1)}
      disabled={value <= min}
      aria-label={`Decrease quantity of ${label}`}
    >
      <FiMinus aria-hidden />
    </StepButton>
    <Value aria-live="polite">{value}</Value>
    <StepButton
      type="button"
      $compact={compact}
      onClick={() => onChange(value + 1)}
      disabled={value >= max}
      aria-label={`Increase quantity of ${label}`}
    >
      <FiPlus aria-hidden />
    </StepButton>
  </Wrapper>
);

export default QuantityStepper;
