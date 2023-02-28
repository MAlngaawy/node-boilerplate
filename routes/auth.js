const express = require("express");
const router = express.Router();
// Import Controller
const { signup, verifyAccount } = require("../controllers/auth");
// Import validators
const { userValidator } = require("../validators/auth");
const { runValidation } = require("../validators");

router.post("/signup", userValidator, runValidation, signup);
router.post("/verify-account", verifyAccount);

module.exports = router;
