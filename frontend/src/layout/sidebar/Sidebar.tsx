import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
// Icons
import {
  MdOutlinePersonOutline,
  MdOutlineSearch,
  MdFavoriteBorder,
  MdOutlineAccountBalanceWallet,
  MdOutlineMouse,
  MdKeyboard,
} from "react-icons/md";
import { ImHeadphones } from "react-icons/im";
import { GiProtectionGlasses } from "react-icons/gi";
import { TbDeviceGamepad2 } from "react-icons/tb";
import { RiComputerLine } from "react-icons/ri";
import { IoIosHelpBuoy } from "react-icons/io";
import { FaFantasyFlightGames, FaHandsHelping } from "react-icons/fa";

import { useAppContext } from "../../context/GameStoreContext";
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

const SidebarFooter = styled.div``;

const HelpContainer = styled.div``;

const Sidebar = () => {
  const { favorites } = useAppContext();

  return (
    <Container>
      <Link to="/">
        <Logo src={LogoImg} />
      </Link>
      <Nav>
        <CatalogButton />
        <NavItem>
          <Link to="/profile">
            <MdOutlinePersonOutline /> Profile
          </Link>
        </NavItem>
        <NavItem>
          <Link to="/search">
            <MdOutlineSearch /> Search
          </Link>
        </NavItem>
        <NavItem>
          <Link to="/favorite">
            <MdFavoriteBorder /> Favorite
            {favorites.length > 0 && ` (${favorites.length})`}
          </Link>
        </NavItem>
        <NavItem>
          <Link to="/balance">
            <MdOutlineAccountBalanceWallet /> Balance
          </Link>
        </NavItem>
      </Nav>
      <Category>
        <CategoryTitle>CATEGORY</CategoryTitle>
        <CategoryList>
          <CategoryItem>
            <Link to="/products/mouse">
              <MdOutlineMouse /> Computer Mouse
            </Link>
          </CategoryItem>
          <CategoryItem>
            <Link to="/products/headphones">
              <ImHeadphones size={15} /> Game Headphones
            </Link>
          </CategoryItem>
          <CategoryItem>
            <Link to="/products/gamepads">
              <TbDeviceGamepad2 /> GamePads
            </Link>
          </CategoryItem>
          <CategoryItem>
            <Link to="/products/vr-glasses">
              <GiProtectionGlasses /> VR Glasses
            </Link>
          </CategoryItem>
          <CategoryItem>
            <Link to="/products/keyboards">
              <MdKeyboard /> Keyboards
            </Link>
          </CategoryItem>
          <CategoryItem>
            <Link to="/products/computer">
              <RiComputerLine /> Computer
            </Link>
          </CategoryItem>
          <CategoryItem>
            <Link to="/products/games">
              <FaFantasyFlightGames /> Games
            </Link>
          </CategoryItem>
        </CategoryList>
      </Category>
      <SidebarFooter>
        <div>Social</div>
        <HelpContainer>
          <NavItem>
            <Link to="/help">
              <FaHandsHelping /> Help
            </Link>
          </NavItem>
          <NavItem>
            <Link to="/conditions">
              <IoIosHelpBuoy /> Conditions
            </Link>
          </NavItem>
        </HelpContainer>
      </SidebarFooter>
    </Container>
  );
};

export default Sidebar;
