const express = require("express");
const router = express.Router();

const { readUserData } = require("../controllers/user");
const { requireSignin } = require("../controllers/auth");

router.get("/user/:user_id", requireSignin, readUserData);

module.exports = router;
