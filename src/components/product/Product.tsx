import React from "react";
import styled from "styled-components";

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
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 13.75rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Image = styled.img`
  height: min-content;
  transform: translate(0, -1.875rem);
`;

type DataType = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  img: string;
};

const Product = ({ id, name, category, price, stock, img }: DataType) => {
  return (
    <Container>
      <ImageContainer>
        <Image src={img} alt={name} />
      </ImageContainer>
      <p>{name}</p>
      <p>{category}</p>
      <p>₦ {price}</p>
      <button type="button">Add to Cart</button>
    </Container>
  );
};

export default Product;
