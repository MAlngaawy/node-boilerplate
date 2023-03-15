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
