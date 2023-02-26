const { check } = require("express-validator");

exports.userValidator = [
  check("name").not().isEmpty().withMessage("Name is required field"),
  check("email").isEmail().withMessage("Enter a valid e-mail"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 char"),
];
