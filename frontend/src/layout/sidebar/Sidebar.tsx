import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@apollo/client";

import { useAuth } from "../../context/AuthContext";
import { CATEGORIES_QUERY } from "../../queries/Queries";
import { CategoriesData } from "../../types/Types";
import formatCurrency from "../../utils/CurrencyFormatter";
import { colors } from "../../styles/theme";
import CatalogButton from "../../components/catalogButton/CatalogButton";
import SocialIcons from "../../components/socialIcons/SocialIcons";
import Logo from "../../components/logo/Logo";
import IconSwitcher from "../../components/iconSwitcher/IconSwitcher";

const Container = styled.div`
  padding: 2.875rem 2.1875rem;
  background-color: ${colors.background};

  a {
    text-decoration: none;
  }

  li {
    list-style: none;
  }
`;

const TopNavs = styled.ul`
  margin-block: 2rem;
`;

const Nav = styled.nav`
  margin-top: 0.625rem;
`;

const NavItem = styled.li`
  a {
    display: flex;
    align-items: center;
    color: ${colors.textSoft};
    transition: color 150ms ease-in;

    &:hover {
      color: #ffffff;
    }
  }

  svg {
    font-size: 1.125rem;
    flex-shrink: 0;
  }

  span {
    margin-left: 0.8125rem;
  }

  &:not(:last-child) {
    margin-bottom: 1.125rem;
  }
`;

const Count = styled.span`
  margin-left: auto !important;
  padding-left: 0.5rem;
  color: ${colors.textMuted};
  font-size: 0.875rem;
`;

const CategoryTitle = styled.h3`
  color: ${colors.textSoft};
  font-size: 1rem;
  margin-block: 2rem;
`;

const SidebarFooter = styled.div``;

const helpPagesList = ["Help", "Conditions"];

const Sidebar = () => {
  const { user, isAdmin } = useAuth();
  const { data } = useQuery<CategoriesData>(CATEGORIES_QUERY);

  const pageList = [
    { name: "Profile", path: "/profile" },
    { name: "Search", path: "/search" },
    {
      name: "Favorite",
      path: "/favorite",
      count: user && user.favorites.length > 0 ? user.favorites.length : null,
    },
    {
      name: "Balance",
      path: "/balance",
      count: user ? formatCurrency(user.balance) : null,
    },
    ...(isAdmin ? [{ name: "New product", path: "/products/new" }] : []),
  ];

  return (
    <Container>
      <Link to="/" aria-label="Game Drill home">
        <Logo width={12.3125} />
      </Link>
      <Nav aria-label="Main">
        <CatalogButton />
        <TopNavs>
          {pageList.map((item) => (
            <NavItem key={item.name}>
              <Link to={item.path}>
                <IconSwitcher name={item.name} />
                <span>{item.name}</span>
                {item.count && <Count>{item.count}</Count>}
              </Link>
            </NavItem>
          ))}
        </TopNavs>
      </Nav>
      <nav aria-labelledby="sidebar-categories">
        <CategoryTitle id="sidebar-categories">CATEGORY</CategoryTitle>
        <ul>
          {data?.categories.map((category) => (
            <NavItem key={category.slug}>
              <Link to={`/products/${category.slug}`}>
                <IconSwitcher name={category.slug} />
                <span>{category.name}</span>
              </Link>
            </NavItem>
          ))}
        </ul>
      </nav>
      <SidebarFooter>
        <SocialIcons />
        <ul>
          {helpPagesList.map((item) => (
            <NavItem key={item}>
              <Link to={`/${item.toLowerCase()}`}>
                <IconSwitcher name={item} />
                <span>{item}</span>
              </Link>
            </NavItem>
          ))}
        </ul>
      </SidebarFooter>
    </Container>
  );
};

export default Sidebar;
