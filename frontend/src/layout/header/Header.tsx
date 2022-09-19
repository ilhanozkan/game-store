import React, { useEffect, useState } from "react";

import { useAppContext } from "../../context/GameStoreContext";
import Search from "../../components/search/Search";
import formatCurrency from "../../utils/CurrencyFormatter";

const Header = () => {
  const { getCartLength, cartList } = useAppContext();
  const [totalPrice, setTotalPrice] = useState("0");

  useEffect(() => {
    setTotalPrice((prevPrice) =>
      formatCurrency(
        cartList.reduce(
          (prev: number, curr: any) => prev + curr.cartQuantity * curr.price,
          0
        )
      )
    );
  }, [cartList]);

  return (
    <div>
      <Search />
      <p>{getCartLength()}</p>
      <p>total: {totalPrice}</p>
    </div>
  );
};

export default Header;
