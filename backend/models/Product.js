const uuid = require("uuid").v4;

class Product {
  constructor(name, category, price, stock, img, description, spesifications) {
    this.id = uuid();
    this.name = name;
    this.category = category;
    this.price = price;
    this.stock = stock;
    this.img = img;
    this.description = description;
    this.spesifications = spesifications;
  }
}

module.exports = Product;
