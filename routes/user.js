const express = require("express");
const router = express.Router();

const { requireSignin, adminMiddleware } = require("../controllers/auth");
const { readUserData } = require("../controllers/user");
const { updateUserName } = require("../controllers/user");

router.get("/user/:user_id", requireSignin, readUserData);
router.put("/user/update", requireSignin, updateUserName);
router.put("/admin/update", requireSignin, adminMiddleware, updateUserName);

module.exports = router;
