const express = require("express");
const router = express.Router();

const { requireSignin, adminMiddleware } = require("../controllers/auth");
const {
  readUserData,
  updateUserName,
  forgetPassword,
  resetPassword,
} = require("../controllers/user");

router.get("/user/:user_id", requireSignin, readUserData);
router.put("/user/update", requireSignin, updateUserName);
router.put("/admin/update", requireSignin, adminMiddleware, updateUserName);
router.post("/user/forget-password", forgetPassword);
router.post("/user/reset-password", resetPassword);

module.exports = router;
