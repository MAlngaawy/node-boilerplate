const express = require("express");
const router = express.Router();

const { requireSignin, adminMiddleware } = require("../controllers/auth");
const {
  readUserData,
  updateUserName,
  forgetPassword,
  resetPassword,
  changePassword,
} = require("../controllers/user");

router.get("/user/:user_id", requireSignin, readUserData);
router.put("/user/update", requireSignin, updateUserName);
router.put("/admin/update", requireSignin, adminMiddleware, updateUserName);
router.post("/user/forget-password", forgetPassword);
router.post("/user/reset-password", resetPassword);
router.put("/user/change-password", requireSignin, changePassword);

module.exports = router;
