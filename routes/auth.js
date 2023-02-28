const express = require("express");
const router = express.Router();
// Import Controller
const { signup, verifyAccount, login } = require("../controllers/auth");
// Import validators
const {
  userSignupValidator,
  userSigninValidator,
} = require("../validators/auth");
const { runValidation } = require("../validators");

router.post("/signup", userSignupValidator, runValidation, signup);
router.post("/verify-account", verifyAccount);
router.post("/login", userSigninValidator, runValidation, login);

module.exports = router;
