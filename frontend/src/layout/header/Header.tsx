import React, { useEffect, useState } from "react";

import { useAppContext } from "../../context/GameStoreContext";
import Search from "../../components/search/Search";
import formatCurrency from "../../utils/CurrencyFormatter";
import { DataType } from "../../types/Types";

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
    <div>
      <Search />
      {getCartLength() && (
        <>
          <p>{getCartLength()}</p>
          <p>total: {totalPrice}</p>
        </>
      )}
    </div>
  );
};

export default Header;
