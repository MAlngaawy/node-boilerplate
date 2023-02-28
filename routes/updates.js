const express = require("express");
const updateRoutes = express.Router();

const { updateUserName } = require("../controllers/updates");
const { updateUserNameValidator } = require("../validators/updates");
const { runValidation } = require("../validators");
updateRoutes.patch(
  "/update-name/:user_id",
  updateUserNameValidator,
  runValidation,
  updateUserName
);

module.exports = updateRoutes;
