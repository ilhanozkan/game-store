import React from "react";
import styled from "styled-components";

import LogoImg from "../../assets/logo.svg";

const LogoEl = styled.img<{ $width: number }>`
  display: block;
  width: ${({ $width }) => `${$width}rem`};
`;

const Logo = ({ width }: { width: number }) => {
  return <LogoEl src={LogoImg} $width={width} alt="Game Drill" />;
};

export default Logo;
