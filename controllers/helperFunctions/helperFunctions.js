exports.forgetPassEmailTemplate = (token) => {
  return `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Password</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    h1 {
      font-family: Arial, sans-serif;
      font-weight: bold;
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 24px;
    }
    p {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      background-color: #3498db;
      color: #fff;
      padding: 10px 20px;
      border-radius: 5px;
      text-decoration: none;
      font-size: 16px;
      margin-top: 20px;
      margin-bottom: 20px;
    }
    .button:hover {
      background-color: #2980b9;
    }
    .footer {
      background-color: #333;
      color: #fff;
      text-align: center;
      padding: 10px;
      margin-top: 20px;
    }
    .footer a {
      color: #fff;
      text-decoration: none;
    }
    .logo {
      display: block;
      margin: 20px auto;
      max-width: 200px;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://www.galenainn.com/wp-content/uploads/2020/07/Download-Welcome-PNG-Transparent.png" alt="Logo" class="logo">
    <h1>Reset Password</h1>
    <p>Dear user,</p>
    <p>We have received a request to reset your password. Please click the button below to reset your password:</p>
    <p> This Link will be expired after <strong>  10 minites  </strong>! </p>
    <a href="${process.env.CLIENT_URL}/reset-password/${token}" class="button">Reset Password</a>
    <p>If you did not request a password reset, please ignore this email.</p>
    <hr />
    <p>This email contains sensitive information and should not be forwarded or shared.</p>
    <p>If you have any questions or concerns, please contact us at support@example.com.</p>
    <div class="footer">
      <p>Thank you for using our service.</p>
      <p><a href="http://localhost:3000" target="_blank">Visit our website</a></p>
    </div>
  </div>
</body>
</html>
    `;
};
