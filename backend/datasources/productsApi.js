const { RESTDataSource } = require("apollo-datasource-rest");

class ProductsAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.REST_API_URL + "/products";
  }

  async getProducts() {
    return this.get("");
  }

  async getProduct(id) {
    return this.get(`${encodeURIComponent(id)}`);
  }

  async getProductsByCategory(category) {
    return this.get(`category/${encodeURIComponent(category)}`);
  }
}

module.exports = ProductsAPI;
