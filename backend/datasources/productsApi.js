const { RESTDataSource } = require("apollo-datasource-rest");

class ProductsAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.REST_API_URL;
  }

  getProducts() {
    return this.get("products");
  }
}

module.exports = ProductsAPI;
