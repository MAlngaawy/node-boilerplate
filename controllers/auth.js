const User = require("../models/user");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch"); // use old version 2 because the new version doesn't support require
const sgMail = require("@sendgrid/mail");
const { expressjwt } = require("express-jwt");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { sendEmailWithNodemailer } = require("../helper/email");
const { OAuth2Client } = require("google-auth-library");

exports.signup = (req, res) => {
  const { name, email, password } = req.body;

  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: "Email is taken",
      });
    } else {
      const token = jwt.sign(
        { name, email, password },
        process.env.JWT_ACCOUNT_ACTIVATION,
        { expiresIn: "10m" }
      );

      const emailData = {
        from: process.env.GMAIL_SENDER_EMAIL, // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
        to: email, // WHO SHOULD BE RECEIVING THIS EMAIL? IT SHOULD BE THE USER EMAIL (VALID EMAIL ADDRESS) WHO IS TRYING TO SIGNUP
        subject: "ACCOUNT ACTIVATION LINK",
        html: `
                <h1>Please use the following link to activate your account</h1>
                <p>http://localhost:3000/auth/activate/${token}</p>
                <hr />
                <p>This email may contain sensitive information</p>
                <p>http://localhost:3000</p>
            `,
      };

      sendEmailWithNodemailer(req, res, emailData);
    }
  });
};

exports.verifyAccount = (req, res) => {
  const { token } = req.body;

  if (token) {
    jwt.verify(
      token,
      process.env.JWT_ACCOUNT_ACTIVATION,
      function (err, decoded) {
        if (err) {
          console.log("Error while decoding", err);
          return res.status(401).json({
            error: "Token expired, Please sign up again",
          });
        } else {
          const { name, email, password } = jwt.decode(token);
          const user = new User({ name, email, password });
          user.save((err, user) => {
            if (err) {
              console.log("Error while add user to the database", err);
              return res.status(401).json({
                error:
                  "Error, saving user in the database, Please try again later",
              });
            } else {
              return res.json({
                message: "Signup Successed, Please sign in",
              });
            }
          });
        }
      }
    );
  } else {
    return res.status(401).json({
      error: "Somethin went wrong, try again later",
    });
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email, password }, (err, user) => {
    if (err || !user) {
      console.log("Sorry Can't fine user", err);
      return res.status(400).json({
        error: "Sorry user with this email not exist",
      });
    }

    // Check if the user is autheticate _ check for the matched password_
    if (!user.authenticate(password)) {
      console.log("User didn't auth", err);
      return res.status(400).json({
        error: "Sorry, e-mail and password don't match",
      });
    }

    // generate token to gave it to the user to use it in the next authrization
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const { _id, email, name, role } = user;

    return res.json({
      token,
      user: { _id, email, name, role },
    });
  });
};

exports.updateUserName = async (req, res) => {
  const { _id, name } = req.body;

  try {
    const user = await User.findByIdAndUpdate(_id, { name }, { new: true });
    return res.json(user);
  } catch {
    return res.status(500).json({ message: "error.message" });
  }
};

exports.requireSignin = expressjwt({
  secret: process.env.JWT_SECRET, // req.auth (The decoded JWT payload)
  algorithms: ["HS256"],
});

exports.adminMiddleware = (req, res, next) => {
  const user_id = req.auth._id;
  User.findById({ _id: user_id }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(400).json({
        error: "Admin resource, Access denied",
      });
    }

    req.profile = user;
    next();
  });
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleAuth = (req, res) => {
  const { idToken } = req.body;
  client
    .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
    .then((response) => {
      const { email_verified, name, email } = response.getPayload();
      if (email_verified) {
        User.findOne({ email }).exec((err, user) => {
          if (user) {
            // generate a token to send to user
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: "7d",
            });
            const { _id, email, name, role } = user;
            return res.json({
              token,
              user: { _id, email, name, role },
            });
          } else {
            let password = email + process.env.GOOGLE_CLIENT_ID; // generate a random password
            const user = new User({ password, email, name });
            user.save((err, user) => {
              if (err) {
                console.log("Record google auth user to database error ", err);
                return res.status(500).json({
                  error: "Server Error, Please Try again later",
                });
              }
              // generate a token to send to user
              const token = jwt.sign(
                { _id: user._id },
                process.env.JWT_SECRET,
                {
                  expiresIn: "7d",
                }
              );
              const { _id, email, name, role } = user;
              return res.json({
                token,
                user: { _id, email, name, role },
              });
            });
          }
        });
      } else {
        return res.status(400).json({
          error: "Google login faild, Try again",
        });
      }
    })
    .catch((err) => {
      console.log("verify Id Token Error", err);
      return res.status(500).json({
        error: "Internal server error",
      });
    });
};

exports.facebookAuth = (req, res) => {
  const { userID, accessToken } = req.body;

  url = `https://graph.facebook.com/v13.0/${userID}?fields=name,email&access_token=${accessToken}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const { name, email, id } = data;
      User.findOne({ email }).exec((err, user) => {
        if (user) {
          // generate a token to send to user
          const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
          });
          const { _id, email, name, role } = user;
          return res.json({
            token,
            user: { _id, email, name, role },
          });
        } else {
          let password = email + process.env.GOOGLE_CLIENT_ID; // generate a random password
          const user = new User({ password, email, name });
          user.save((err, user) => {
            if (err) {
              console.log("Record google auth user to database error ", err);
              return res.status(500).json({
                error: "Server Error, Please Try again later",
              });
            }
            // generate a token to send to user
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: "7d",
            });
            const { _id, email, name, role } = user;
            return res.json({
              token,
              user: { _id, email, name, role },
            });
          });
        }
      });
    })
    .catch((err) => {
      console.log("ERROR WHILE FETCHING FACEBOOK USER DATA", err);
      return res.status(500).json({
        error: "Internal server error",
      });
    });
};
