import React from "react";
import styled from "styled-components";
import { BsStar, BsStarFill, BsStarHalf } from "react-icons/bs";

import { colors } from "../../styles/theme";

const Wrapper = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: ${colors.textMuted};
  font-size: 0.875rem;
`;

const Stars = styled.span`
  display: inline-flex;
  gap: 0.125rem;
  color: ${colors.warning};
`;

type RatingProps = {
  value: number;
  count?: number;
};

const Rating = ({ value, count }: RatingProps) => {
  const rounded = Math.round(value * 2) / 2;
  const label = `Rated ${value.toFixed(1)} out of 5${
    count !== undefined ? ` from ${count} reviews` : ""
  }`;

  return (
    <Wrapper role="img" aria-label={label} title={label}>
      <Stars aria-hidden>
        {[1, 2, 3, 4, 5].map((star) => {
          if (rounded >= star) return <BsStarFill key={star} />;
          if (rounded >= star - 0.5) return <BsStarHalf key={star} />;
          return <BsStar key={star} />;
        })}
      </Stars>
      <span aria-hidden>
        {value.toFixed(1)}
        {count !== undefined && ` (${count})`}
      </span>
    </Wrapper>
  );
};

export default Rating;
