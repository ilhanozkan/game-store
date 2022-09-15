import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import LogoImg from "../../assets/logo.svg";
import CatalogButton from "../../components/catalogButton/CatalogButton";

const Container = styled.div`
  a {
    color: #fff;
    text-decoration: none;
  }

  li {
    list-style: none;
  }

  padding: 1.60625rem 2.194375rem;
  color: #fff;
  background-color: #191919;
`;

const Logo = styled.img``;

const Nav = styled.ul``;

const NavItem = styled.li``;

const Category = styled.div``;

const CategoryTitle = styled.h3``;

const CategoryList = styled.ul``;

const CategoryItem = styled.li``;

const Sidebar = () => {
  return (
    <Container>
      <Link to="/">
        <Logo src={LogoImg} />
      </Link>
      <Nav>
        <CatalogButton />
        <NavItem>
          <Link to="/profile">Profile</Link>
        </NavItem>
        <NavItem>
          <Link to="/search">Search</Link>
        </NavItem>
        <NavItem>
          <Link to="/favorite">Favorite</Link>
        </NavItem>
        <NavItem>
          <Link to="/balance">Balance</Link>
        </NavItem>
      </Nav>
      <Category>
        <CategoryTitle>CATEGORY</CategoryTitle>
        <CategoryList>
          <CategoryItem>
            <Link to="/products/mouse">Computer Mouse</Link>
          </CategoryItem>
          <CategoryItem>
            <Link to="/products/game-headphones">Game Headphones</Link>
          </CategoryItem>
          <CategoryItem>
            <Link to="/products/gamepads">GamePads</Link>
          </CategoryItem>
          <CategoryItem>
            <Link to="/products/vr-glasses">VR Glasses</Link>
          </CategoryItem>
          <CategoryItem>
            <Link to="/products/keyboards">Keyboards</Link>
          </CategoryItem>
          <CategoryItem>
            <Link to="/products/computer">Computer</Link>
          </CategoryItem>
          <CategoryItem>
            <Link to="/products/games">Games</Link>
          </CategoryItem>
        </CategoryList>
      </Category>
    </Container>
  );
};

export default Sidebar;
