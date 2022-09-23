import React from "react";
import styled from "styled-components";

import Header from "./header/Header";
import Footer from "./footer/Footer";
import Sidebar from "./sidebar/Sidebar";
import AppRoutes from "../routes/AppRoutes";

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

const TopSide = styled.div`
  min-height: 90vh;
  display: grid;
  grid-template-columns: 16.5625rem auto;
`;

const RightSide = styled.div`
  padding: 2.875rem 3.9375rem 2.875rem 2.875rem;
`;

const Layout = () => {
  return (
    <Container>
      <TopSide>
        <Sidebar />
        <RightSide>
          <Header />
          <AppRoutes />
        </RightSide>
      </TopSide>
      <Footer />
    </Container>
  );
};

export default Layout;
