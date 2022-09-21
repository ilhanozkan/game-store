import { ApolloError } from "@apollo/client";

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

export type FavsType = {
  userFavs: DataType[];
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
  favorite: (id: string) => void;
  favorites: string[];
  favoritesList: DataType[];
  setFavoritesList: React.Dispatch<React.SetStateAction<DataType[]>>;
  favsLoading: boolean;
  favsError: ApolloError | undefined;
};
