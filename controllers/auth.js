const User = require("../models/user");
exports.signup = (req, res) => {
  //Access the request data
  const { name, email, password } = req.body;

  //Check if the user email istajen in the databse
  User.findOne({ email }).exec((err, user) => {
    if (user) {
      // the app will end here -with this return- if the user has exest
      return res.status(400).json({
        error: "Email is taken",
      });
    } else {
      let newUser = new User({ email, name, password });
      newUser.save((err, success) => {
        if (err) {
          console.log("SIGNUP ERROR", err);
          return res.status(400).json({
            error: err,
          });
        }

        res.json({
          message: "Signup success! Please signin",
        });
      });
    }
  });
};
