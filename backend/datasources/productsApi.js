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
}

module.exports = ProductsAPI;
