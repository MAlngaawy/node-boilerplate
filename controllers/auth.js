const User = require("../models/user");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { sendEmailWithNodemailer } = require("../helper/email");

// exports.signup = (req, res) => {
//   //Access the request data
//   const { name, email, password } = req.body;

//   //Check if the user email istajen in the databse
//   User.findOne({ email }).exec((err, user) => {
//     if (user) {
//       return res.status(400).json({
//         error: "Email is taken",
//       });
//     } else {
//       let newUser = new User({ email, name, password });
//       newUser.save((err, success) => {
//         if (err) {
//           console.log("SIGNUP ERROR", err);
//           return res.status(400).json({
//             error: err,
//           });
//         }

//         res.json({
//           message: "Signup success! Please signin",
//         });
//       });
//     }
//   });
// };

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
            error: "Error,  while decoding the token, Please try again later",
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
