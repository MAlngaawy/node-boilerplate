const { check } = require("express-validator");

exports.updateUserNameValidator = [
  check("name").not().isEmpty().withMessage("Name is required field"),
];
