import React from "react";
import styled from "styled-components";

import { useAppContext } from "../../context/GameStoreContext";
import { CartBoxType, DataType } from "../../types/Types";

const Container = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  background-color: #191919;
  width: 20rem;
  height: 100vh;
  animation-duration: 500ms;
  animation-name: cart-slide;

  @keyframes cart-slide {
    from {
      right: -20rem;
    }

    to {
      right: 0;
    }
  }
`;

const CartBox = ({ active, setActive, totalPrice }: CartBoxType) => {
  const { cartList, setCartList } = useAppContext();

  if (active)
    return (
      <Container>
        <button type="button" onClick={() => setActive(false)}>
          X
        </button>
        {cartList.map((item: DataType) => (
          <div key={item._id}>
            <span>{item.name} </span>
            <span>x {item.cartQuantity}</span>
          </div>
        ))}
        <p>Total Price: {totalPrice}</p>
        <button type="button" onClick={() => setCartList([])}>
          Clear Cart
        </button>
      </Container>
    );
  return null;
};

export default CartBox;
