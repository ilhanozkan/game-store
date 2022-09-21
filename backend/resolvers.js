const resolvers = {
  Query: {
    products: (_, __, { dataSources }) => {
      return dataSources.productsAPI.getProducts();
    },
    product: async (_, { id }, { dataSources }) => {
      return dataSources.productsAPI.getProduct(id);
    },
    user: async (_, { id }, { dataSources }) => {
      return dataSources.userAPI.getUser(id);
    },
    userFavs: async (_, { id }, { dataSources }) => {
      return dataSources.userAPI.getFavs(id);
    },
  },
};

module.exports = resolvers;
