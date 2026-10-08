import React from "react";
import styled from "styled-components";
import { ImFacebook2, ImTwitter } from "react-icons/im";
import { IoLogoInstagram } from "react-icons/io";

const Container = styled.ul`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-block: 1rem;
  list-style: none;

  a {
    display: flex;
    color: #d4dae8;
    transition: color 150ms ease-in;

    &:hover {
      color: #ffffff;
    }
  }
`;

const LINKS = [
  {
    name: "Twitter",
    href: "https://twitter.com",
    icon: <ImTwitter size="1.3rem" />,
  },
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: <ImFacebook2 size="1.2rem" />,
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: <IoLogoInstagram size="1.5rem" />,
  },
];

const SocialIcons = () => {
  return (
    <Container aria-label="Social media">
      {LINKS.map((link) => (
        <li key={link.name}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`${link.name} (opens in a new tab)`}
          >
            {link.icon}
          </a>
        </li>
      ))}
    </Container>
  );
};

export default SocialIcons;
