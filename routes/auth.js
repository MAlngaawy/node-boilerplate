const express = require("express");
const router = express.Router();
// Import Controller
const { signup } = require("../controllers/auth");
// Import validators
const { userValidator } = require("../validators/auth");
const { runValidation } = require("../validators");

router.post("/signup", userValidator, runValidation, signup);

module.exports = router;
