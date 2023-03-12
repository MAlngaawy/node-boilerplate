const express = require("express");
const router = express.Router();

const { readUserData } = require("../controllers/user");

router.get("/user/:user_id", readUserData);

module.exports = router;
