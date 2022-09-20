import React, { createContext, useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { DataType, ContextType } from "../types/Types";

export const GameStoreContext = createContext({} as ContextType);

export const GameStoreProvider = ({ children }: any) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cartList, setCartList] = useState([]);

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
      }}
    >
      {children}
    </GameStoreContext.Provider>
  );
};

export const useAppContext = () => useContext(GameStoreContext);
