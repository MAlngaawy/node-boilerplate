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
    if (user.hashed_password) {
      user.hashed_password = undefined;
    }
    user.salt = undefined;
    res.json(user);
  });
};

exports.updateUserName = (req, res) => {
  const user_id = req.auth._id;
  const newName = req.body.name;
  console.log("Body", newName);
  User.findByIdAndUpdate(
    { _id: user_id },
    { name: newName },
    { new: true }, // this is here to tell the  (findByIdAndUpdate) to return the new version of user
    (err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: err,
        });
      }

      return res.json({
        user,
      });
    }
  );
};
