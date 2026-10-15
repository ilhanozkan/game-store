import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import Logo from "../../components/logo/Logo";
import SocialIcons from "../../components/socialIcons/SocialIcons";
import { colors } from "../../styles/theme";
import { tablet } from "../../responsive";

const Container = styled.footer`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: center;
  gap: 1rem 2.5rem;
  min-height: 5.88rem;
  padding: 1.5rem 2rem;
  background-color: ${colors.background};

  ${tablet({ flexDirection: "column", textAlign: "center" })}

  svg {
    fill: #a6a6a6;
    transition: fill 150ms ease-in;
  }

  a:hover svg {
    fill: #fff;
  }
`;

const Links = styled.ul`
  display: flex;
  gap: 1.5rem;
  list-style: none;

  a {
    color: ${colors.textMuted};
    text-decoration: none;

    &:hover {
      color: #fff;
      text-decoration: underline;
    }
  }
`;

const Copyright = styled.p`
  color: rgba(255, 255, 255, 0.5);
`;

const Footer = () => {
  return (
    <Container>
      <Link to="/" aria-label="Game Drill home">
        <Logo width={8} />
      </Link>
      <Copyright>
        © {new Date().getFullYear()} Game Drill. All rights reserved.
      </Copyright>
      <nav aria-label="Footer">
        <Links>
          <li>
            <Link to="/help">Help</Link>
          </li>
          <li>
            <Link to="/conditions">Terms</Link>
          </li>
        </Links>
      </nav>
      <SocialIcons />
    </Container>
  );
};

export default Footer;
