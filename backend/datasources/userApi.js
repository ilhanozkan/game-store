const { RESTDataSource } = require("apollo-datasource-rest");

class UserAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = process.env.REST_API_URL + "/users";
  }

  async getUser(id) {
    return this.get(`${encodeURIComponent(id)}`);
  }

  async getFavs(id) {
    return this.get(`${encodeURIComponent(id)}/favorites`);
  }
}

module.exports = UserAPI;
