import React from "react";
import styled from "styled-components";
import { ImFacebook2, ImTwitter } from "react-icons/im";
import { IoLogoInstagram } from "react-icons/io";

const Container = styled.div`
  display: flex;
  align-items: center;
  margin-block: 1rem;

  a {
    color: #d4dae8;
    transition: color 150ms ease-in;

    &:hover {
      color: #ffffff;
    }
  }

  * {
    &:not(:last-child) {
      margin-right: 1rem;
    }
  }
`;

const SocialIcons = () => {
  return (
    <Container>
      <a href="https://twitter.com" target="_blank" rel="noreferrer">
        <ImTwitter size="1.3rem" />
      </a>
      <a href="https://facebook.com" target="_blank" rel="noreferrer">
        <ImFacebook2 size="1.2rem" />
      </a>
      <a href="https://instagram.com" target="_blank" rel="noreferrer">
        <IoLogoInstagram size="1.5rem" />
      </a>
    </Container>
  );
};

export default SocialIcons;
