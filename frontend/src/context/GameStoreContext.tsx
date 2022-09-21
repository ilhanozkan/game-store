import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useQuery, gql } from "@apollo/client";

import { DataType, ContextType } from "../types/Types";

export const GameStoreContext = createContext({} as ContextType);

const uid = "1";

const USER_QUERY = gql`
  query getUser {
    user(id: "1") {
      favorites
    }
  }
`;

export const GameStoreProvider = ({ children }: any) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cartList, setCartList] = useState([]);
  const { loading, data } = useQuery(USER_QUERY);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesList, setFavoritesList] = useState<Array<DataType>>([]);

  useEffect(() => {
    if (data) setFavorites(data?.user.favorites);
  }, [data]);

  useEffect(() => {
    if (!loading) {
      axios.post(
        `${process.env.REACT_APP_REST_API_URL}/users/${uid}/favorite` ||
          `http://localhost:5000/users/${uid}/favorite`,
        { favorites }
      );
    }
  }, [favorites]);

  const getCartLength = () => {
    return cartList.reduce(
      (prev: number, curr: DataType) => prev + curr.cartQuantity,
      0
    );
  };

  const increaseQuantityInCart = (id: string) => {
    setCartList((prev: any) => {
      return prev.map((item: DataType) => {
        if (item?.id == id) {
          return { ...item, cartQuantity: item.cartQuantity + 1 };
        }
        return item;
      });
    });
  };

  const decreaseQuantityInCart = (id: string) => {
    setCartList((prev: any) => {
      return prev.map((item: DataType) => {
        if (item?.id == id) {
          return { ...item, cartQuantity: item.cartQuantity - 1 };
        }
        return item;
      });
    });
  };

  const favorite = (id: string) => {
    setFavorites((prev: Array<string> | []) => {
      if (favorites.includes(id))
        return favorites.filter((selection) => selection != id);
      return [...prev, id];
    });
  };

  return (
    <GameStoreContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        searchParams,
        setSearchParams,
        cartList,
        setCartList,
        getCartLength,
        increaseQuantityInCart,
        decreaseQuantityInCart,
        favorite,
        favorites,
      }}
    >
      {children}
    </GameStoreContext.Provider>
  );
};

export const useAppContext = () => useContext(GameStoreContext);
