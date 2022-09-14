import React from "react";
import { css } from "styled-components";

const sizes = {
  mobile: "320px",
  tablet: "768px",
  laptop: "1024px",
  laptopL: "1440px",
  desktop: "2560px",
};

export const mobile = ({ styles }: any) => {
  return css`
    @media (max-width: ${sizes.mobile}) {
      ${styles}
    }
  `;
};

export const tablet = ({ styles }: any) => {
  return css`
    @media (max-width: ${sizes.tablet}) {
      ${styles}
    }
  `;
};