import React from "react";
import styled from "styled-components";

import LogoImg from "../../assets/logo.svg";

const LogoEl = styled.img<{ width: number }>`
  width: ${(props) => (props.width ? `${props.width}rem` : `${12.3125}rem`)};
`;

const Logo = ({ widthh }: { widthh: number }) => {
  return <LogoEl src={LogoImg} width={widthh} />;
};

export default Logo;
