const User = require("../models/user");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { sendEmailWithNodemailer } = require("../helper/email");
const {
  forgetPassEmailTemplate,
} = require("./helperFunctions/helperFunctions");

exports.readUserData = (req, res) => {
  const user_id = req.params.user_id;
  User.findById(user_id).exec((err, user) => {
    if (err || !user) {
      console.log(err);
      return res.status(400).json({
        error: "User not found",
      });
    }

    user.hashed_password = undefined;
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

exports.forgetPassword = (req, res) => {
  // Access user email from the request body
  const email = req.body.email;

  console.log("\nemail \n", email);

  // check if the email is active
  User.findOne({ email }).exec((err, user) => {
    // return error if there is no user with this email
    if (err) {
      console.log(err);
      return res.status(400).json({
        error: "User not found",
      });
    }

    if (!user) {
      return res.status(401).json({
        error: "User Doesn't exist",
      });
    }

    // if no error
    const token = jwt.sign({ email }, process.env.JWT_RESET_PASSWORD, {
      expiresIn: "10m",
    });

    const emailData = {
      from: process.env.GMAIL_SENDER_EMAIL, // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
      to: email,
      subject: "RESET PASSWORD LINK",
      html: forgetPassEmailTemplate(token),
    };
    sendEmailWithNodemailer(req, res, emailData);
  });
};

exports.resetPassword = (req, res) => {
  const { token, password } = req.body;

  if (token) {
    jwt.verify(token, process.env.JWT_RESET_PASSWORD, function (err, decoded) {
      if (err) {
        console.log("Error while decoding", err);
        return res.status(401).json({
          error: "Token expired, Please sign up again",
        });
      } else {
        const { email } = jwt.decode(token);
        User.findOne({ email }, (err, user) => {
          if (err || !user) {
            console.log("UPDATE PASSWORD ERROR =>", err);
            return res.status(400).json({
              error: "User Not found",
            });
          }

          if (password) {
            if (password.length < 6) {
              return res.status(400).json({
                error: "Password must be more than 6 charachter",
              });
            } else {
              user.password = password;
            }
          } else {
            return res.status(400).json({
              error: "Password field is required",
            });
          }

          user.save((err, updatedUser) => {
            if (err) {
              console.log("USER UPDATE ERROR", err);
              return res.status(400).json({
                error: "User update failed",
              });
            }
            updatedUser.hashed_password = undefined;
            updatedUser.salt = undefined;
            res.json({ user: updatedUser });
          });
        });
      }
    });
  } else {
    return res.status(401).json({
      error: "Token is required",
    });
  }
};

exports.changePassword = (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Get the authorization header value
  const token = req.headers.authorization.split(" ")[1];

  // Decode the token and retrieve the email information
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decodedToken._id;

  User.findOne({ _id: userId }, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the old password matches
    if (!user.authenticate(oldPassword)) {
      return res.status(401).json({ error: "Invalid old password" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 charachter" });
    }

    // Set the new password and save the user
    user.password = newPassword;
    user.save((err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
      }
      return res.status(200).json({ message: "Password changed successfully" });
    });
  });
};
