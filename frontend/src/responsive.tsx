import { css, CSSObject } from "styled-components";

export const sizes = {
  mobile: "320px",
  tablet: "768px",
  laptop: "1024px",
  laptopL: "1440px",
  desktop: "2560px",
};

// Media query matching phones and tablets, where the sidebar becomes a drawer.
export const COMPACT_QUERY = `(max-width: ${sizes.laptop})`;

export const mobile = (styles: CSSObject) => {
  return css`
    @media screen and (max-width: ${sizes.mobile}) {
      ${styles}
    }
  `;
};

export const tablet = (styles: CSSObject) => {
  return css`
    @media screen and (max-width: ${sizes.tablet}) {
      ${styles}
    }
  `;
};

export const laptop = (styles: CSSObject) => {
  return css`
    @media screen and (max-width: ${sizes.laptop}) {
      ${styles}
    }
  `;
};
