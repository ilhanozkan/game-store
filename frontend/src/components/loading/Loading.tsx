import React from "react";
import styled from "styled-components";

import { colors } from "../../styles/theme";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 3rem 0;
  color: ${colors.primary};
`;

const SVG = styled.svg`
  width: 3.5rem;
  fill: currentColor;
`;

const Loading = ({ label = "Loading" }: { label?: string }) => {
  return (
    <Wrapper role="status" aria-label={label}>
      <SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden>
        <path
          opacity=".25"
          d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4"
        />
        <path d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 16 16"
            to="360 16 16"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </path>
      </SVG>
    </Wrapper>
  );
};

export default Loading;
