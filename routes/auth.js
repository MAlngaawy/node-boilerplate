const express = require("express");
const router = express.Router();
// Import Controller
const { signup } = require("../controllers/auth");

router.get("/signup", signup);

module.exports = router;
