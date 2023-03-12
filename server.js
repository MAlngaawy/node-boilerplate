const express = require("express");
const morgan = require("morgan");
const cors = require("cors"); // running the React app in 3000 and the server in 8000 will give us an error and we use cors to avviod it
const bodyParser = require("body-parser"); // to parse the JSON data to javascript bject
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Connect to Database
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB Error => ", err));

// import routes
const authRoutes = require("./routes/auth");
const updateRoutes = require("./routes/updates");
const userRoutes = require("./routes/user");

// App middleware
app.use(morgan("dev"));
app.use(bodyParser.json()); // you can see whats happening when server receve request (the request retails)
// app.use(cors()); // allows all origins
if ((process.env.NODE_ENV = "development")) {
  app.use(cors({ origin: "http://localhost:3000" })); // Allow just this URL to make request
}

// middleware
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/update", updateRoutes);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("App Runs Successfull");
});
