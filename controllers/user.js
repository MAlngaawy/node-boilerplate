const User = require("../models/user");

exports.readUserData = (req, res) => {
  const user_id = req.params.user_id;
  User.findById(user_id).exec((err, user) => {
    if (err || !user) {
      console.log(err);
      res.status(400).json({
        error: "User not found",
      });
    }
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  });
};
