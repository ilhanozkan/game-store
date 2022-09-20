export type DataType = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  img: string;
  cartQuantity: number;
};

export type ProductsType = {
  products: DataType[];
};

export type ContextType = {
  searchParams: URLSearchParams;
  setSearchParams: (params: { [key: string]: string }) => void;
  // cartList: [] | Array<DataType>;
  cartList: any;
  setCartList: React.Dispatch<React.SetStateAction<any>>;
  getCartLength: () => number;
  increaseQuantityInCart: (id: string) => void;
  decreaseQuantityInCart: (id: string) => void;
};
