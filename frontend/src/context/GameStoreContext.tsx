import React, { createContext, useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";

type DataType = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  img: string;
  cartQuantity: number;
};

type ContextType = {
  searchParams: URLSearchParams;
  setSearchParams: (params: { [key: string]: string }) => void;
  // cartList: [] | Array<DataType>;
  cartList: any;
  setCartList: React.Dispatch<React.SetStateAction<any>>;
  getCartLength: () => number;
  increaseQuantityInCart: (id: string) => void;
  decreaseQuantityInCart: (id: string) => void;
};

export const GameStoreContext = createContext({} as ContextType);

export const GameStoreProvider = ({ children }: any) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cartList, setCartList] = useState([]);

  const getCartLength = () => {
    return cartList.reduce(
      (prev: number, curr: any) => prev + curr.cartQuantity,
      0
    );
  };

  const increaseQuantityInCart = (id: string) => {
    setCartList((prev: any) => {
      return prev.map((item: any) => {
        if (item?.id == id) {
          return { ...item, cartQuantity: item.cartQuantity + 1 };
        }
        return item;
      });
    });
  };

  const decreaseQuantityInCart = (id: string) => {
    setCartList((prev: any) => {
      return prev.map((item: any) => {
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
