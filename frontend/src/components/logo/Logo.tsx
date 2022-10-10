import React from "react";
import styled from "styled-components";

import LogoImg from "../../assets/logo.svg";

const LogoEl = styled.img<{ width: number }>`
  width: ${({ width }) => `${width}rem`};
`;

const Logo = ({ width }: { width: number }) => {
  return <LogoEl src={LogoImg} width={width} />;
};

export default Logo;
