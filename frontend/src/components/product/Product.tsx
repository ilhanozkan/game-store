import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { TiHeartFullOutline } from "react-icons/ti";

import { useAppContext } from "../../context/GameStoreContext";
import formatCurrency from "../../utils/CurrencyFormatter";
import { DataType } from "../../types/Types";

const FavoriteButton = styled.button`
  position: absolute;
  font-size: 1.2rem;
  opacity: 0;
  z-index: 1;
  top: 0.35rem;
  right: 0.6rem;
  cursor: pointer;
  background: none;
  border: none;
`;

const Container = styled.div`
  width: 19.725625rem;
  height: 23.209375rem;
  background: #2d2d2e;
  color: #fff;
  border-radius: 0.42125rem;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  transition: outline 30ms ease-in;
  position: relative;

  &:hover {
    outline: 0.206875rem solid rgba(255, 255, 255, 0.5);

    ${FavoriteButton} {
      opacity: 1;
    }
  }

  a {
    color: #fff;
    text-decoration: none;
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 11.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Image = styled.img`
  max-width: 100%;
  height: min-content;
  transform: translate(0, -2.58461957rem);
`;

const CardInfo = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;

const Category = styled.h4`
  margin-bottom: 0.625rem;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);

  &:hover {
    text-decoration: underline;
  }
`;

const Price = styled.p`
  margin-bottom: 0.625rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #618dff;
`;

const CartButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  width: 8.5rem;

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background: none;
    color: #fff;
    cursor: pointer;
  }
`;

const AddButton = styled.button`
  display: flex;
  gap: 0.635rem;
  font-size: 0.9rem;
  border: none;

  &:hover {
    button {
      background-color: #618dff;
    }
  }
`;

const IncreaseButton = styled.button`
  background: none;
  width: 2.125rem;
  height: 2.125rem;
  font-size: 1.625rem;
  border: 1px solid #fff;
  border-radius: 50%;
  transition: background-color 75ms ease-in;

  &:hover {
    background-color: #618dff;
  }
`;

const DecreaseButton = styled.button`
  background: none;
  width: 2.125rem;
  height: 2.125rem;
  font-size: 1.625rem;
  border: 1px solid #fff;
  border-radius: 50%;
  transition: background-color 75ms ease-in;

  &:hover {
    background-color: #618dff;
  }
`;

const Product = (data: { data: DataType }) => {
  // eslint-disable-next-line react/destructuring-assignment
  const prod = JSON.parse(JSON.stringify(data.data));
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { _id, name, category, price, stock, img } = prod;
  const {
    setCartList,
    cartList,
    increaseQuantityInCart,
    decreaseQuantityInCart,
    favorite,
    favorites,
    favoritesList,
    setFavoritesList,
  } = useAppContext();
  const [isActiveQuantityButtons, setIsActiveQuantityButtons] = useState(false);
  const [quantityInCart, setQuantityInCart] = useState(0);

  useEffect(() => {
    if (!cartList.length) {
      setQuantityInCart(0);
      setIsActiveQuantityButtons(false);
    }
  }, [cartList]);

  const addToCart = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const target = e.target as HTMLTextAreaElement;

    switch (target.name) {
      case "init":
        setIsActiveQuantityButtons(true);

        increaseQuantityInCart(_id);
        setQuantityInCart(1);
        prod.cartQuantity = 1;

        setCartList((prev: Array<DataType> | []) => [...prev, prod]);
        break;
      case "increase":
        setQuantityInCart(quantityInCart + 1);
        increaseQuantityInCart(_id);
        break;
      case "decrease":
        if (quantityInCart == 1) {
          setQuantityInCart(quantityInCart - 1);
          setCartList(cartList.filter((cart: DataType) => cart._id != _id));
          setIsActiveQuantityButtons(false);
          return;
        }
        setQuantityInCart(quantityInCart - 1);
        decreaseQuantityInCart(_id);
        break;
      default:
        break;
    }
  };

  const handleFavorite = () => {
    favorite(_id);
    setFavoritesList((prev) => {
      if (favorites.includes(_id))
        return favoritesList.filter((item) => item._id != _id);

      return [...prev, prod];
    });
  };

  if (stock <= 0) return null;

  return (
    <Container>
      <FavoriteButton onClick={handleFavorite}>
        {favorites.includes(_id) ? (
          <TiHeartFullOutline size="1.75rem" fill="#ff2f6c" />
        ) : (
          <TiHeartFullOutline size="1.75rem" fill="#cfdcff" opacity={0.4} />
        )}
      </FavoriteButton>
      <ImageContainer>
        <Image src={img} alt={name} />
      </ImageContainer>
      <CardInfo>
        <Title>{name}</Title>
        <Link to={`/products/${category.toLowerCase().replaceAll(" ", "-")}`}>
          <Category>{category.replaceAll("-", " ")}</Category>
        </Link>
        <Price>{formatCurrency(price)}</Price>
        {isActiveQuantityButtons ? (
          <CartButtons>
            <DecreaseButton type="button" name="decrease" onClick={addToCart}>
              -
            </DecreaseButton>
            <span>{quantityInCart}</span>
            <IncreaseButton type="button" name="increase" onClick={addToCart}>
              +
            </IncreaseButton>
          </CartButtons>
        ) : (
          <CartButtons>
            <AddButton type="button" name="init" onClick={addToCart}>
              <IncreaseButton type="button" name="init">
                +
              </IncreaseButton>
              Add to Cart
            </AddButton>
          </CartButtons>
        )}
      </CardInfo>
    </Container>
  );
};

export default Product;
