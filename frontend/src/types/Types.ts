export type ProductSort =
  | "FEATURED"
  | "NEWEST"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "RATING"
  | "NAME";

export type ProductSpec = {
  label: string;
  value: string;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  categorySlug: string;
  price: number;
  stock: number;
  img: string | null;
  rating: number;
  reviewCount: number;
};

export type ProductDetail = Product & {
  description: string;
  specs: ProductSpec[];
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
};

export type Role = "CUSTOMER" | "ADMIN";

export type User = {
  _id: string;
  name: string;
  username: string;
  email: string;
  img: string | null;
  role: Role;
  balance: number;
  favorites: string[];
  createdAt: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  img: string | null;
  price: number;
  quantity: number;
  subtotal: number;
};

export type Order = {
  _id: string;
  reference: string;
  items: OrderItem[];
  itemCount: number;
  total: number;
  status: string;
  createdAt: string;
};

export type Transaction = {
  _id: string;
  type: "TOP_UP" | "PURCHASE";
  amount: number;
  balanceAfter: number;
  description: string;
  orderId: string | null;
  createdAt: string;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  img: string | null;
  stock: number;
  quantity: number;
};

// Query result shapes
export type ProductsData = { products: Product[] };
export type ProductData = { product: ProductDetail | null };
export type CategoriesData = { categories: Category[] };
export type CategoryData = { category: Category | null };
export type MeData = { me: User | null };
export type FavoritesData = {
  me: { _id: string; favoriteProducts: Product[] } | null;
};
export type OrdersData = { myOrders: Order[] };
export type TransactionsData = { myTransactions: Transaction[] };
