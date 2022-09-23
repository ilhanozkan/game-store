const uuid = require("uuid").v4;
const router = require("express").Router();

const User = require("../../models/User");

const firstUser = new User();

const { dummyData } = require("../products/products");

router.get(`/:id`, (req, res) => {
  const id = req.params.id;

  res.send(firstUser);
});

router.get(`/:id/favorites`, (req, res) => {
  const favoritesId = firstUser.favorites;
  const favoriteProducts = dummyData.filter((data) =>
    favoritesId.includes(data.id)
  );

  res.send(favoriteProducts);
});

router.post(`/:id/favorite`, (req, res) => {
  const { favorites } = req.body;
  firstUser.updateFavorites(favorites);

  res.status(200).json({ message: "Favorites updated" });
});

router.post(`/delete/:id`, (req, res) => {
  const username = req.body.username;
  const id = uuid();

  res.send(`${username}, ${id} is deleted`);
});

module.exports = router;
