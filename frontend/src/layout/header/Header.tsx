import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { BsBag } from "react-icons/bs";
import { HiOutlineMenuAlt2 } from "react-icons/hi";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import Search from "../../components/search/Search";
import CartBox, { CART_BUTTON_ID } from "../../components/cartBox/CartBox";
import Avatar from "../../components/avatar/Avatar";
import Logo from "../../components/logo/Logo";
import Notifications from "../../components/notifications/Notifications";
import { ButtonLink } from "../../components/ui/Button";
import { laptop, tablet } from "../../responsive";
import { colors } from "../../styles/theme";

const Container = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas: "search user";
  align-items: center;
  gap: 1rem;
  margin-bottom: 2.9375rem;

  ${laptop({
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
    gridTemplateAreas: '"menu logo user" "search search search"',
    rowGap: "1.25rem",
    marginBottom: "2rem",
  })}
`;

const MenuButton = styled.button`
  display: none;
  grid-area: menu;
  padding: 0.25rem;
  border: none;
  border-radius: 50%;
  background: none;
  color: #fff;
  font-size: 1.875rem;
  cursor: pointer;

  ${laptop({ display: "flex" })}
`;

const MobileLogo = styled(Link)`
  display: none;
  grid-area: logo;

  ${laptop({ display: "block" })}
`;

const SearchArea = styled.div`
  grid-area: search;
`;

const UserSection = styled.div`
  grid-area: user;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Profile = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #fff;
  text-decoration: none;

  &:hover span {
    text-decoration: underline;
  }
`;

const ProfileName = styled.span`
  ${tablet({
    position: "absolute",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    whiteSpace: "nowrap",
  })}
`;

const IconButton = styled.button`
  position: relative;
  display: flex;
  padding: 0.25rem;
  border: none;
  border-radius: 50%;
  background: none;
  color: #fff;
  cursor: pointer;
`;

const CartLength = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  min-width: 1.5rem;
  height: 1.5rem;
  padding-inline: 0.25rem;
  border-radius: 100rem;
  background-color: ${colors.badge};
  font-size: 0.8125rem;
  top: -0.9rem;
  right: -1rem;
`;

type HeaderProps = {
  onMenuClick: () => void;
  menuOpen: boolean;
};

const Header = ({ onMenuClick, menuOpen }: HeaderProps) => {
  const { user, loading } = useAuth();
  const { itemCount, openCart } = useCart();

  return (
    <Container>
      <CartBox />
      <MenuButton
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        aria-expanded={menuOpen}
        aria-controls="site-navigation"
      >
        <HiOutlineMenuAlt2 aria-hidden />
      </MenuButton>
      <MobileLogo to="/" aria-label="Game Drill home">
        <Logo width={9} />
      </MobileLogo>
      <SearchArea>
        <Search />
      </SearchArea>
      <UserSection>
        {user && (
          <Profile to="/profile" aria-label={`Your profile, ${user.name}`}>
            <ProfileName aria-hidden>{user.name}</ProfileName>
            <Avatar name={user.name} src={user.img} />
          </Profile>
        )}
        {!user && !loading && (
          <ButtonLink to="/login" $size="sm">
            Sign in
          </ButtonLink>
        )}
        <Notifications />
        <IconButton
          id={CART_BUTTON_ID}
          type="button"
          onClick={openCart}
          aria-label={`Open cart, ${itemCount} item${
            itemCount === 1 ? "" : "s"
          }`}
        >
          {itemCount > 0 && <CartLength aria-hidden>{itemCount}</CartLength>}
          <BsBag size="1.5rem" aria-hidden />
        </IconButton>
      </UserSection>
    </Container>
  );
};

export default Header;
