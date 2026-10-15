import React from "react";
import styled from "styled-components";

import { ProductSort } from "../../types/Types";
import { colors, radii } from "../../styles/theme";

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "FEATURED", label: "Featured" },
  { value: "PRICE_ASC", label: "Price: low to high" },
  { value: "PRICE_DESC", label: "Price: high to low" },
  { value: "RATING", label: "Top rated" },
  { value: "NEWEST", label: "Newest" },
  { value: "NAME", label: "Name" },
];

// Reads a sort from a URL value such as "price_asc", defaulting to FEATURED.
export const parseSort = (value: string | null): ProductSort => {
  const upper = (value || "").toUpperCase();
  return SORT_OPTIONS.some((option) => option.value === upper)
    ? (upper as ProductSort)
    : "FEATURED";
};

const Wrapper = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  color: ${colors.textMuted};
  font-size: 0.9375rem;
`;

const Select = styled.select`
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  border: 1px solid ${colors.border};
  border-radius: ${radii.sm};
  background: ${colors.surface}
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23d4dae8' d='M6 8 0 0h12z'/%3E%3C/svg%3E")
    no-repeat right 0.75rem center;
  color: #fff;
  font-size: 0.9375rem;
  cursor: pointer;
  appearance: none;

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }

  option {
    background: ${colors.surface};
  }
`;

type SortSelectProps = {
  value: ProductSort;
  onChange: (sort: ProductSort) => void;
};

const SortSelect = ({ value, onChange }: SortSelectProps) => (
  <Wrapper>
    Sort by
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as ProductSort)}
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  </Wrapper>
);

export default SortSelect;
