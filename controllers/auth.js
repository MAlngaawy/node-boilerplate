exports.signup = (req, res) => {
  console.log("POST REQ BODY ", req.body);
  res.json({
    data: "Hello World From routes folder from controllers",
  });
};
