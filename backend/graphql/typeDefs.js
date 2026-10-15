const typeDefs = `#graphql
  "ISO-8601 date and time, e.g. 2026-01-31T12:00:00.000Z"
  scalar DateTime

  enum ProductSort {
    "Catalog order"
    FEATURED
    NEWEST
    PRICE_ASC
    PRICE_DESC
    RATING
    NAME
  }

  enum Role {
    CUSTOMER
    ADMIN
  }

  enum TransactionType {
    TOP_UP
    PURCHASE
  }

  enum OrderStatus {
    PAID
    CANCELLED
  }

  type ProductSpec {
    label: String!
    value: String!
  }

  type Product {
    _id: ID!
    name: String!
    slug: String!
    brand: String!
    "Display name of the product's category"
    category: String!
    categorySlug: String!
    "Price in whole Naira (NGN)"
    price: Float!
    stock: Int!
    inStock: Boolean!
    img: String
    description: String!
    rating: Float!
    reviewCount: Int!
    specs: [ProductSpec!]!
    "Whether the signed-in user has favorited this product"
    isFavorite: Boolean!
    createdAt: DateTime!
  }

  type Category {
    _id: ID!
    name: String!
    slug: String!
    description: String!
    productCount: Int!
  }

  type User {
    _id: ID!
    name: String!
    username: String!
    email: String!
    img: String
    role: Role!
    "Store credit in whole Naira (NGN)"
    balance: Float!
    "IDs of favorited products"
    favorites: [ID!]!
    "Favorited products, most recently added first"
    favoriteProducts: [Product!]!
    createdAt: DateTime!
  }

  type OrderItem {
    productId: ID!
    name: String!
    img: String
    price: Float!
    quantity: Int!
    subtotal: Float!
  }

  type Order {
    _id: ID!
    "Short human-friendly reference"
    reference: String!
    items: [OrderItem!]!
    itemCount: Int!
    total: Float!
    status: OrderStatus!
    createdAt: DateTime!
  }

  type Transaction {
    _id: ID!
    type: TransactionType!
    "Positive for top-ups, negative for purchases"
    amount: Float!
    balanceAfter: Float!
    description: String!
    orderId: ID
    createdAt: DateTime!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    name: String!
    username: String!
    email: String!
    password: String!
  }

  input LoginInput {
    "Username or email address"
    identifier: String!
    password: String!
  }

  input UpdateProfileInput {
    name: String
    email: String
    img: String
  }

  input CartItemInput {
    productId: ID!
    quantity: Int!
  }

  input ProductSpecInput {
    label: String!
    value: String!
  }

  input CreateProductInput {
    name: String!
    "Category slug or name"
    category: String!
    price: Float!
    stock: Int!
    brand: String
    img: String
    description: String
    specs: [ProductSpecInput!]
  }

  type Query {
    products(
      "Category slug or name"
      category: String
      search: String
      sort: ProductSort = FEATURED
      inStockOnly: Boolean = false
    ): [Product!]!
    "Look up a product by ID or slug"
    product(id: ID!): Product
    productsByCategory(category: String!): [Product!]!
      @deprecated(reason: "Use products(category:) instead.")
    categories: [Category!]!
    category(slug: String!): Category
    "The signed-in user, or null"
    me: User
    myOrders: [Order!]!
    myTransactions: [Transaction!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateProfile(input: UpdateProfileInput!): User!
    "Adds the product to favorites, or removes it if already there"
    toggleFavorite(productId: ID!): User!
    "Places an order paid from the signed-in user's balance"
    checkout(items: [CartItemInput!]!): Order!
    "Adds store credit to the signed-in user's balance (demo wallet)"
    topUpBalance(amount: Int!): User!
    "Admins only"
    createProduct(input: CreateProductInput!): Product!
  }
`;

module.exports = typeDefs;
