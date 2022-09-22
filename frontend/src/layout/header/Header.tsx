import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { IoMdNotificationsOutline } from "react-icons/io";
import { BsBag } from "react-icons/bs";

import { useAppContext } from "../../context/GameStoreContext";
import Search from "../../components/search/Search";
import formatCurrency from "../../utils/CurrencyFormatter";
import { DataType } from "../../types/Types";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
`;

const Profile = styled.div`
  display: flex;
  align-items: center;
`;

const Username = styled.span`
  margin-right: 1.569375rem;
`;

const Image = styled.img`
  width: 3.4327rem;
  height: 3.4327rem;
  border-radius: 50%;
  object-fit: cover;
`;

const Header = () => {
  const { getCartLength, cartList } = useAppContext();
  const [totalPrice, setTotalPrice] = useState("0");

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
      <Search />
      <UserSection>
        <Profile>
          <Username>Fola</Username>
          <Image
            src="https://images.unsplash.com/photo-1522529599102-193c0d76b5b6"
            alt="Profile"
          />
        </Profile>
        <IoMdNotificationsOutline size="1.390625rem" />
        <BsBag />
      </UserSection>
      {/* {getCartLength() && (
        <>
          <p>{getCartLength()}</p>
          <p>total: {totalPrice}</p>
        </>
      )} */}
    </Container>
  );
};

export default Header;
