const uuid = require("uuid").v4;
const router = require("express").Router();

router.get(`/:id`, (req, res) => {
  const id = req.params.id;

  res.send(`User ${id}'s page is online`);
});

router.post(`/delete/:id`, (req, res) => {
  const username = req.body.username;
  const id = uuid();

  res.send(`${username}, ${id} is deleted`);
});

module.exports = router;
