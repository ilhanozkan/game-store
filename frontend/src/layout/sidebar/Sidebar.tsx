import React, { useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@apollo/client";
import { IoClose } from "react-icons/io5";

import { useAuth } from "../../context/AuthContext";
import { CATEGORIES_QUERY } from "../../queries/Queries";
import { CategoriesData } from "../../types/Types";
import formatCurrency from "../../utils/CurrencyFormatter";
import useDialog from "../../hooks/useDialog";
import useMediaQuery from "../../hooks/useMediaQuery";
import { colors } from "../../styles/theme";
import { COMPACT_QUERY, laptop } from "../../responsive";
import CatalogButton from "../../components/catalogButton/CatalogButton";
import SocialIcons from "../../components/socialIcons/SocialIcons";
import Logo from "../../components/logo/Logo";
import IconSwitcher from "../../components/iconSwitcher/IconSwitcher";
import { Bone } from "../../components/skeleton/Skeleton";

const Container = styled.aside<{ $open: boolean }>`
  padding: 2.875rem 2.1875rem;
  background-color: ${colors.background};

  a {
    text-decoration: none;
  }

  li {
    list-style: none;
  }

  /* On smaller screens the sidebar becomes an off-canvas drawer. Hidden
     drawers use visibility so their links can't be reached with Tab. */
  ${({ $open }) =>
    laptop({
      position: "fixed",
      top: 0,
      bottom: 0,
      left: 0,
      zIndex: 40,
      width: "min(19rem, 85vw)",
      padding: "1.5rem 1.75rem",
      overflowY: "auto",
      boxShadow: $open ? "1rem 0 2rem rgba(0, 0, 0, 0.45)" : "none",
      transform: $open ? "translateX(0)" : "translateX(-100%)",
      visibility: $open ? "visible" : "hidden",
      transition: $open
        ? "transform 250ms ease-out"
        : "transform 250ms ease-in, visibility 0s linear 250ms",
    })}
`;

const Backdrop = styled.div`
  display: none;

  ${laptop({
    display: "block",
    position: "fixed",
    inset: 0,
    zIndex: 35,
    background: "rgba(0, 0, 0, 0.6)",
  })}
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CloseButton = styled.button`
  display: flex;
  padding: 0.25rem;
  border: none;
  border-radius: 50%;
  background: none;
  color: ${colors.textSoft};
  font-size: 1.75rem;
  cursor: pointer;
`;

const TopNavs = styled.ul`
  margin-block: 2rem;
`;

const Nav = styled.nav`
  margin-top: 0.625rem;
`;

const NavItem = styled.li`
  a {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0.25rem 0;
    color: ${colors.textSoft};
    transition: color 150ms ease-in;

    &:hover {
      color: #ffffff;
    }

    &.active {
      color: #ffffff;
      font-weight: 700;

      svg {
        color: ${colors.primary};
      }

      &::before {
        content: "";
        position: absolute;
        left: -2.1875rem;
        top: 0;
        bottom: 0;
        width: 0.25rem;
        border-radius: 0 0.25rem 0.25rem 0;
        background: ${colors.primary};
      }
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
    margin-bottom: 0.875rem;
  }
`;

const Count = styled.span`
  margin-left: auto !important;
  padding-left: 0.5rem;
  color: ${colors.textMuted};
  font-size: 0.875rem;
  font-weight: 500;
`;

const CategoryTitle = styled.h2`
  color: ${colors.textSoft};
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin-block: 2rem 1.25rem;
`;

const helpPagesList = [
  { name: "Help", path: "/help" },
  { name: "Conditions", path: "/conditions" },
];

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const { user, isAdmin } = useAuth();
  const { data, loading } = useQuery<CategoriesData>(CATEGORIES_QUERY);
  const isCompact = useMediaQuery(COMPACT_QUERY);
  const drawerOpen = isCompact && open;
  const ref = useRef<HTMLElement>(null);
  useDialog(ref, drawerOpen, onClose);

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
    <>
      {drawerOpen && <Backdrop onClick={onClose} aria-hidden />}
      <Container
        ref={ref}
        id="site-navigation"
        $open={open}
        aria-label="Site navigation"
        role={drawerOpen ? "dialog" : undefined}
        aria-modal={drawerOpen || undefined}
        tabIndex={drawerOpen ? -1 : undefined}
      >
        <TopRow>
          <Link to="/" aria-label="Game Drill home">
            <Logo width={12.3125} />
          </Link>
          {isCompact && (
            <CloseButton
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
            >
              <IoClose aria-hidden />
            </CloseButton>
          )}
        </TopRow>
        <Nav aria-label="Main">
          <CatalogButton />
          <TopNavs>
            {pageList.map((item) => (
              <NavItem key={item.name}>
                <NavLink to={item.path}>
                  <IconSwitcher name={item.name} />
                  <span>{item.name}</span>
                  {item.count && <Count>{item.count}</Count>}
                </NavLink>
              </NavItem>
            ))}
          </TopNavs>
        </Nav>
        <nav aria-labelledby="sidebar-categories">
          <CategoryTitle id="sidebar-categories">CATEGORY</CategoryTitle>
          <ul aria-busy={loading && !data}>
            {loading &&
              !data &&
              [70, 85, 60, 65, 75, 55, 50].map((width) => (
                <NavItem key={width} aria-hidden>
                  <Bone $width={`${width}%`} $height="1.25rem" />
                </NavItem>
              ))}
            {data?.categories.map((category) => (
              <NavItem key={category.slug}>
                <NavLink to={`/products/${category.slug}`}>
                  <IconSwitcher name={category.slug} />
                  <span>{category.name}</span>
                </NavLink>
              </NavItem>
            ))}
          </ul>
        </nav>
        <div>
          <SocialIcons />
          <ul>
            {helpPagesList.map((item) => (
              <NavItem key={item.name}>
                <NavLink to={item.path}>
                  <IconSwitcher name={item.name} />
                  <span>{item.name}</span>
                </NavLink>
              </NavItem>
            ))}
          </ul>
        </div>
      </Container>
    </>
  );
};

export default Sidebar;
