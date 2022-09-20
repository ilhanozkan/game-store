import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useAppContext } from "../../context/GameStoreContext";

import formatCurrency from "../../utils/CurrencyFormatter";

const Container = styled.div`
  width: 19.725625rem;
  height: 23.209375rem;
  background: #2d2d2e;
  color: #fff;
  border-radius: 0.42125rem;
  margin-bottom: 4.38rem;
  margin-right: 2.360625rem;
  transition: outline 30ms ease-in;

  &:hover {
    outline: 0.206875rem solid rgba(255, 255, 255, 0.5);
  }

  a {
    color: #fff;
    text-decoration: none;
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 13.75rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Image = styled.img`
  max-width: 100%;
  height: min-content;
  transform: translate(0, -2.58461957rem);
`;

type DataType = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  img: string;
  cartQuantity: number;
};

const Product = (data: { data: DataType }) => {
  // eslint-disable-next-line react/destructuring-assignment
  const prod = JSON.parse(JSON.stringify(data.data));
  const { id, name, category, price, stock, img } = prod;
  const {
    setCartList,
    cartList,
    increaseQuantityInCart,
    decreaseQuantityInCart,
  } = useAppContext();
  const [isActiveQuantityButtons, setIsActiveQuantityButtons] = useState(false);
  const [quantityInCart, setQuantityInCart] = useState(0);

  const addToCart = (e: any) => {
    switch (e.target.name) {
      case "init":
        setIsActiveQuantityButtons(true);

        increaseQuantityInCart(id);
        setQuantityInCart(1);
        prod.cartQuantity = 1;

        setCartList((prev: Array<DataType> | []) => [...prev, prod]);
        break;
      case "increase":
        setQuantityInCart(quantityInCart + 1);
        increaseQuantityInCart(id);
        break;
      case "decrease":
        if (quantityInCart == 1) {
          setQuantityInCart(quantityInCart - 1);
          setCartList(cartList.filter((cart: DataType) => cart.id != id));
          setIsActiveQuantityButtons(false);
        } else {
          setQuantityInCart(quantityInCart - 1);
          decreaseQuantityInCart(id);
        }
        break;
      default:
        break;
    }
  };

  if (stock <= 0) return null;

  return (
    <Container>
      <ImageContainer>
        <Image src={img} alt={name} />
      </ImageContainer>
      <p>{name}</p>
      <Link to={`/products/${category.toLowerCase().replaceAll(" ", "-")}`}>
        <p>{category}</p>
      </Link>
      <p>{formatCurrency(price)}</p>
      {isActiveQuantityButtons ? (
        <div>
          <button type="button" name="decrease" onClick={addToCart}>
            -
          </button>
          <span>{quantityInCart}</span>
          <button type="button" name="increase" onClick={addToCart}>
            +
          </button>
        </div>
      ) : (
        <button type="button" name="init" onClick={addToCart}>
          Add to Cart
        </button>
      )}
    </Container>
  );
};

export default Product;
