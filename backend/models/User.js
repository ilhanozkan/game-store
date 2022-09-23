const uuid = require("uuid").v4;

class User {
  constructor() {
    this.id = "1" || uuid();
    this.favorites = [];
  }

  updateFavorites(favorites) {
    this.favorites = favorites;
  }
}

module.exports = User;
