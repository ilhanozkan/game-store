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
import SocialIcons from "../../components/socialIcons/SocialIcons";

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

const Logo = styled.img`
  width: 12.3125rem;
  margin-bottom: 0.625rem;
`;

const TopNavs = styled.div`
  margin-block: 2rem;
`;

const Nav = styled.ul``;

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

const Sidebar = () => {
  const { favorites } = useAppContext();

  return (
    <Container>
      <Link to="/">
        <Logo src={LogoImg} />
      </Link>
      <Nav>
        <CatalogButton />
        <TopNavs>
          <NavItem>
            <Link to="/profile">
              <MdOutlinePersonOutline />
              <span>Profile</span>
            </Link>
          </NavItem>
          <NavItem>
            <Link to="/search">
              <MdOutlineSearch />
              <span>Search</span>
            </Link>
          </NavItem>
          <NavItem>
            <Link to="/favorite">
              <MdFavoriteBorder />
              <span>
                Favorite {favorites.length > 0 && ` (${favorites.length})`}
              </span>
            </Link>
          </NavItem>
          <NavItem>
            <Link to="/balance">
              <MdOutlineAccountBalanceWallet />
              <span>Balance</span>
            </Link>
          </NavItem>
        </TopNavs>
      </Nav>
      <Category>
        <CategoryTitle>CATEGORY</CategoryTitle>
        <CategoryList>
          <NavItem>
            <Link to="/products/mouse">
              <MdOutlineMouse />
              <span>Computer Mouse</span>
            </Link>
          </NavItem>
          <NavItem>
            <Link to="/products/headphones">
              <ImHeadphones size={15} />
              <span>Game Headphones</span>
            </Link>
          </NavItem>
          <NavItem>
            <Link to="/products/gamepads">
              <TbDeviceGamepad2 />
              <span>GamePads</span>
            </Link>
          </NavItem>
          <NavItem>
            <Link to="/products/vr-glasses">
              <GiProtectionGlasses />
              <span>VR Glasses</span>
            </Link>
          </NavItem>
          <NavItem>
            <Link to="/products/keyboards">
              <MdKeyboard />
              <span>Keyboards</span>
            </Link>
          </NavItem>
          <NavItem>
            <Link to="/products/computer">
              <RiComputerLine />
              <span>Computer</span>
            </Link>
          </NavItem>
          <NavItem>
            <Link to="/products/games">
              <FaFantasyFlightGames />
              <span>Games</span>
            </Link>
          </NavItem>
        </CategoryList>
      </Category>
      <SidebarFooter>
        <SocialIcons />
        <HelpContainer>
          <NavItem>
            <Link to="/help">
              <FaHandsHelping />
              <span>Help</span>
            </Link>
          </NavItem>
          <NavItem>
            <Link to="/conditions">
              <IoIosHelpBuoy />
              <span>Conditions</span>
            </Link>
          </NavItem>
        </HelpContainer>
      </SidebarFooter>
    </Container>
  );
};

export default Sidebar;
