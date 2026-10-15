const { GraphQLScalarType, Kind } = require("graphql");

const authService = require("../services/authService");
const categoryService = require("../services/categoryService");
const productService = require("../services/productService");
const userService = require("../services/userService");
const orderService = require("../services/orderService");

const { requireUser, requireAdmin } = authService;

const toDate = (value) => {
  const date = new Date(value);
  if (typeof value !== "string" || Number.isNaN(date.getTime())) {
    throw new TypeError("DateTime must be an ISO-8601 string");
  }
  return date;
};

const DateTime = new GraphQLScalarType({
  name: "DateTime",
  description: "ISO-8601 date and time",
  serialize: (value) => new Date(value).toISOString(),
  parseValue: toDate,
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING) {
      throw new TypeError("DateTime must be an ISO-8601 string");
    }
    return toDate(ast.value);
  },
});

// Mutations that change the signed-in user also refresh it on the context,
// so fields resolved afterwards (e.g. Product.isFavorite) see the new state.
const withFreshUser = (context, updated) => {
  context.user = updated;
  return updated;
};

const sameId = (a) => (b) => String(a) === String(b);

const resolvers = {
  DateTime,

  Role: { CUSTOMER: "customer", ADMIN: "admin" },
  TransactionType: { TOP_UP: "top-up", PURCHASE: "purchase" },
  OrderStatus: { PAID: "paid", CANCELLED: "cancelled" },

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
    register: async (_, { input }, context) => {
      const payload = await authService.register(input, context);
      withFreshUser(context, payload.user);
      return payload;
    },
    login: async (_, { input }, context) => {
      const payload = await authService.login(input, context);
      withFreshUser(context, payload.user);
      return payload;
    },
    updateProfile: async (_, { input }, context) =>
      withFreshUser(
        context,
        await userService.updateProfile(requireUser(context.user), input)
      ),
    toggleFavorite: async (_, { productId }, context) =>
      withFreshUser(
        context,
        await userService.toggleFavorite(requireUser(context.user), productId)
      ),
    checkout: (_, { items }, { user }) =>
      orderService.checkout(requireUser(user), items),
    topUpBalance: async (_, { amount }, context) =>
      withFreshUser(
        context,
        await userService.topUpBalance(requireUser(context.user), amount)
      ),
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
