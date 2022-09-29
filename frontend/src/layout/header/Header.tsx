import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { IoMdNotificationsOutline } from "react-icons/io";
import { BsBag } from "react-icons/bs";

import { useAppContext } from "../../context/GameStoreContext";
import Search from "../../components/search/Search";
import formatCurrency from "../../utils/CurrencyFormatter";
import CartBox from "../../components/cartBox/CartBox";
import { DataType } from "../../types/Types";
import { tablet } from "../../responsive";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.9375rem;

  ${tablet({ flexDirection: "column", alignItems: "flex-start" })}
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;

  ${tablet({ marginTop: "1rem" })}
`;

const Profile = styled.div`
  display: flex;
  align-items: center;
`;

const Username = styled.span`
  margin-right: 1.569375rem;
`;

const Image = styled.img`
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  object-fit: cover;
`;

const Button = styled.button`
  margin-left: 1rem;
  position: relative;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;

  &:last-child {
    margin-right: 0.5rem;
  }
`;

const CartLength = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: #cc2431;
  top: -1.1rem;
  right: -1.2rem;
`;

const Header = () => {
  const { getCartLength, cartList } = useAppContext();
  const [totalPrice, setTotalPrice] = useState("0");
  const [cartBoxActive, setCartBoxActive] = useState(false);

  useEffect(() => {
    setTotalPrice(() =>
      formatCurrency(
        cartList.reduce(
          (prev: number, curr: DataType) =>
            prev + curr.cartQuantity * curr.price,
          0
        )
      )
    );
  }, [cartList]);

  return (
    <Container>
      <CartBox
        active={cartBoxActive}
        setActive={setCartBoxActive}
        totalPrice={totalPrice}
      />
      <Search />
      <UserSection>
        <Profile>
          <Username>Fola</Username>
          <Image
            src="https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?ixlib=rb-1.2.1&w=100"
            alt="Profile"
          />
        </Profile>
        <Button>
          <IoMdNotificationsOutline size="1.75rem" />
        </Button>
        <Button onClick={() => setCartBoxActive(true)}>
          {getCartLength() > 0 && <CartLength>{getCartLength()}</CartLength>}
          <BsBag size="1.5rem" />
        </Button>
      </UserSection>
    </Container>
  );
};

export default Header;
