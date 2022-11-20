import React from "react";
import styled from "styled-components";

import Logo from "../../components/logo/Logo";
import SocialIcons from "../../components/socialIcons/SocialIcons";

const Container = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  padding-inline: 21rem;
  min-height: 5.88rem;
  background-color: #191919;

  svg {
    fill: #a6a6a6;
    transition: fill 150ms ease-in;

    &:hover {
      fill: #fff;
    }
  }
`;

const Copyright = styled.p`
  color: rgba(255, 255, 255, 0.5);
`;

const Footer = () => {
  return (
    <Container>
      <Logo width={8} />
      <Copyright>All rights reserved 2022 ®</Copyright>
      <SocialIcons />
    </Container>
  );
};

export default Footer;
