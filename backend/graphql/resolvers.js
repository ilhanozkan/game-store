const { GraphQLScalarType, Kind } = require("graphql");

const authService = require("../services/authService");
const categoryService = require("../services/categoryService");
const productService = require("../services/productService");
const userService = require("../services/userService");
const orderService = require("../services/orderService");

const { requireUser, requireAdmin } = authService;

const DateTime = new GraphQLScalarType({
  name: "DateTime",
  description: "ISO-8601 date and time",
  serialize: (value) => new Date(value).toISOString(),
  parseValue: (value) => new Date(value),
  parseLiteral: (ast) =>
    ast.kind === Kind.STRING ? new Date(ast.value) : null,
});

const sameId = (a) => (b) => String(a) === String(b);

const resolvers = {
  DateTime,

  Role: { CUSTOMER: "customer", ADMIN: "admin" },
  TransactionType: { TOP_UP: "top-up", PURCHASE: "purchase" },

  Query: {
    products: (_, args) => productService.listProducts(args),
    product: (_, { id }) => productService.getProduct(id),
    productsByCategory: (_, { category }) =>
      productService.listProducts({ category }),
    categories: (_, __, { getCategories }) => getCategories(),
    category: (_, { slug }) => categoryService.getCategory(slug),
    me: (_, __, { user }) => user,
    myOrders: (_, __, { user }) => orderService.listOrders(requireUser(user)),
    myTransactions: (_, __, { user }) =>
      userService.listTransactions(requireUser(user)),
  },

  Mutation: {
    register: (_, { input }) => authService.register(input),
    login: (_, { input }) => authService.login(input),
    updateProfile: (_, { input }, { user }) =>
      userService.updateProfile(requireUser(user), input),
    toggleFavorite: (_, { productId }, { user }) =>
      userService.toggleFavorite(requireUser(user), productId),
    checkout: (_, { items }, { user }) =>
      orderService.checkout(requireUser(user), items),
    topUpBalance: (_, { amount }, { user }) =>
      userService.topUpBalance(requireUser(user), amount),
    createProduct: (_, { input }, { user }) => {
      requireAdmin(user);
      return productService.createProduct(input);
    },
  },

  Product: {
    category: async (product, _, { getCategoryNames }) =>
      (await getCategoryNames()).get(product.category) || product.category,
    categorySlug: (product) => product.category,
    inStock: (product) => product.stock > 0,
    isFavorite: (product, _, { user }) =>
      Boolean(user && user.favorites.some(sameId(product._id))),
  },

  Category: {
    productCount: async (category, _, { getProductCounts }) =>
      (await getProductCounts()).get(category.slug) || 0,
  },

  User: {
    favoriteProducts: (user) => userService.getFavoriteProducts(user),
  },

  Order: {
    reference: (order) => orderService.orderReference(order._id),
    itemCount: (order) =>
      order.items.reduce((count, item) => count + item.quantity, 0),
  },

  OrderItem: {
    productId: (item) => item.product,
    subtotal: (item) => item.price * item.quantity,
  },

  Transaction: {
    orderId: (transaction) => transaction.order || null,
  },
};

module.exports = resolvers;
