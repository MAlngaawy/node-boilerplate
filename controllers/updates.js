const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.updateUserName = async (req, res) => {
  const { user_id } = req.params;
  const { name } = req.body;
  const authHeader = req.headers["authorization"];

  // verif the token here lol
  const token = authHeader && authHeader.split(" ")[1]; // Skil The bearer word

  if (!token) {
    console.log("NO Token");
    return res.status(400).json({
      error: "Not Authrized",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.log("Sory", err);
      return res.status(403).json({
        error: err,
      });
    }

    const { _id } = jwt.decode(token);

    try {
      const user = await User.findByIdAndUpdate(_id, { name }, { new: true });
      return res.json(user);
    } catch {
      return res.status(500).json({ message: "error.message" });
    }
  });
};
