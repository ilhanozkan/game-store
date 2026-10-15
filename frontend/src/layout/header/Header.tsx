import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { IoMdNotificationsOutline } from "react-icons/io";
import { BsBag } from "react-icons/bs";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import Search from "../../components/search/Search";
import CartBox from "../../components/cartBox/CartBox";
import Avatar from "../../components/avatar/Avatar";
import { ButtonLink } from "../../components/ui/Button";
import { tablet } from "../../responsive";
import { colors } from "../../styles/theme";

const Container = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2.9375rem;

  ${tablet({ flexDirection: "column", alignItems: "flex-start" })}
`;

const UserSection = styled.div`
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

const IconButton = styled.button`
  position: relative;
  display: flex;
  padding: 0.25rem;
  border: none;
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

const Header = () => {
  const { user, loading } = useAuth();
  const { itemCount, openCart } = useCart();

  return (
    <Container>
      <CartBox />
      <Search />
      <UserSection>
        {user && (
          <Profile to="/profile">
            <span>{user.name}</span>
            <Avatar name={user.name} src={user.img} />
          </Profile>
        )}
        {!user && !loading && (
          <ButtonLink to="/login" $size="sm">
            Sign in
          </ButtonLink>
        )}
        <IconButton type="button" aria-label="Notifications">
          <IoMdNotificationsOutline size="1.75rem" aria-hidden />
        </IconButton>
        <IconButton
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
