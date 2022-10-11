import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { useAppContext } from "../../context/GameStoreContext";
import CatalogButton from "../../components/catalogButton/CatalogButton";
import SocialIcons from "../../components/socialIcons/SocialIcons";
import Logo from "../../components/logo/Logo";
import IconSwitcher from "../../components/iconSwitcher/IconSwitcher";

const Container = styled.div`
  padding: 2.875rem 2.1875rem;
  background-color: #191919;

  a {
    text-decoration: none;
  }

  li {
    list-style: none;
  }
`;

const TopNavs = styled.div`
  margin-block: 2rem;
`;

const Nav = styled.ul`
  margin-top: 0.625rem;
`;

const NavItem = styled.li`
  a {
    display: flex;
    align-items: center;
    color: #d4dae8;
    transition: color 150ms ease-in;

    &:hover {
      color: #ffffff;
    }
  }

  svg {
    font-size: 1.125rem;
  }

  span {
    margin-left: 0.8125rem;
  }

  &:not(:last-child) {
    margin-bottom: 1.125rem;
  }
`;

const Category = styled.div``;

const CategoryTitle = styled.h3`
  color: #d4dae8;
  margin-block: 2rem;
`;

const CategoryList = styled.ul``;

const SidebarFooter = styled.div``;

const HelpContainer = styled.div``;

const pageList = ["Profile", "Search", "Favorite", "Balance"];

const categoryList = [
  { name: "Computer Mouse", path: "mouse" },
  { name: "Game Headphones", path: "headphones" },
  { name: "GamePads", path: "gamepads" },
  { name: "VR Glasses", path: "vr-glasses" },
  { name: "Keyboards", path: "keyboards" },
  { name: "Computer", path: "computer" },
  { name: "Games", path: "games" },
];

const helpPagesList = ["Help", "Conditions"];

const Sidebar = () => {
  const { favorites } = useAppContext();

  return (
    <Container>
      <Link to="/">
        <Logo width={12.3125} />
      </Link>
      <Nav>
        <CatalogButton />
        <TopNavs>
          {pageList.map((item) => (
            <NavItem key={item}>
              <Link to={`/${item.toLowerCase()}`}>
                <IconSwitcher name={item} />
                <span>
                  {item == "Favorite" && favorites.length > 0
                    ? `${item} (${favorites.length})`
                    : item}
                </span>
              </Link>
            </NavItem>
          ))}
        </TopNavs>
      </Nav>
      <Category>
        <CategoryTitle>CATEGORY</CategoryTitle>
        <CategoryList>
          {categoryList.map((item) => (
            <NavItem key={item.name}>
              <Link to={`/products/${item.path}`}>
                <IconSwitcher name={item.name} />
                <span>{item.name}</span>
              </Link>
            </NavItem>
          ))}
        </CategoryList>
      </Category>
      <SidebarFooter>
        <SocialIcons />
        <HelpContainer>
          {helpPagesList.map((item) => (
            <NavItem key={item}>
              <Link to={item}>
                <IconSwitcher name={item} />
                <span>{item}</span>
              </Link>
            </NavItem>
          ))}
        </HelpContainer>
      </SidebarFooter>
    </Container>
  );
};

export default Sidebar;
