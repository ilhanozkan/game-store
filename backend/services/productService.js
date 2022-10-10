const Product = require("../models/Product");

class ProductService {
  constructor(model) {
    this.model = model;
  }

  async insert(object) {
    return await this.model.create(object);
  }

  find(filter) {
    return this.model.find(filter);
  }

  findById(id) {
    return this.model.findById(id);
  }

  load() {
    return this.model.find();
  }
}

module.exports = new ProductService(Product);
