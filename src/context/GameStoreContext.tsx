import React, { createContext, useContext } from "react";
import { useSearchParams } from "react-router-dom";

type SearchContextType = {
  searchParams: URLSearchParams;
  setSearchParams: (params: { [key: string]: string }) => void;
};

export const GameStoreContext = createContext({} as SearchContextType);

export const GameStoreProvider = ({ children }: any) => {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <GameStoreContext.Provider value={{ searchParams, setSearchParams }}>
      {children}
    </GameStoreContext.Provider>
  );
};

export const useSearchContext = () => useContext(GameStoreContext);
