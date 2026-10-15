import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";

import Header from "./header/Header";
import Footer from "./footer/Footer";
import Sidebar from "./sidebar/Sidebar";
import AppRoutes from "../routes/AppRoutes";
import RouteChangeManager from "../components/routeChangeManager/RouteChangeManager";
import { useCart } from "../context/CartContext";
import { colors } from "../styles/theme";
import { laptop, tablet } from "../responsive";

const MAIN_ID = "main";

const Container = styled.div`
  background: radial-gradient(
    93.34% 93.34% at 50% 3.48%,
    #212223 0%,
    rgba(33, 33, 35, 0.96) 18.23%,
    #212123 35.94%,
    #212123 53.12%,
    #212123 67.19%,
    #222123 75%,
    #212123 86.46%,
    #232326 89.77%,
    #252528 93.38%,
    #27272b 96.99%,
    #29292e 100%
  );
`;

const SkipLink = styled.a`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 100;
  padding: 0.75rem 1.25rem;
  border-radius: 100rem;
  background: ${colors.primary};
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  transform: translateY(-200%);

  &:focus {
    transform: none;
  }
`;

const TopSide = styled.div`
  min-height: 90vh;
  display: grid;
  grid-template-columns: 16.5625rem minmax(0, 1fr);

  ${laptop({ gridTemplateColumns: "minmax(0, 1fr)" })}
`;

const RightSide = styled.div`
  padding: 2.875rem 3.9375rem 2.875rem 2.875rem;

  ${laptop({ padding: "1.5rem 2rem 3rem" })}
  ${tablet({ padding: "1rem 1rem 2.5rem" })}
`;

const Main = styled.main`
  &:focus {
    outline: none;
  }
`;

const Layout = () => {
  const { pathname } = useLocation();
  const { closeCart } = useCart();
  const [navOpen, setNavOpen] = useState(false);
  const openNav = useCallback(() => setNavOpen(true), []);
  const closeNav = useCallback(() => setNavOpen(false), []);

  // Close overlays whenever the page changes.
  useEffect(() => {
    setNavOpen(false);
    closeCart();
  }, [pathname, closeCart]);

  return (
    <Container>
      <SkipLink href={`#${MAIN_ID}`}>Skip to main content</SkipLink>
      <RouteChangeManager mainId={MAIN_ID} />
      <TopSide>
        <Sidebar open={navOpen} onClose={closeNav} />
        <RightSide>
          <Header onMenuClick={openNav} menuOpen={navOpen} />
          <Main id={MAIN_ID} tabIndex={-1}>
            <AppRoutes />
          </Main>
        </RightSide>
      </TopSide>
      <Footer />
    </Container>
  );
};

export default Layout;
