require("../app/db/connection");
const express = require("express"),
  cors = require("cors");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

//Main Routes
const dataRoute = require("../app/routes/data.route");
const userRoute = require("../app/routes/user.route");
const adminRoute = require("../app/routes/admin.route");

app.use("/data", dataRoute);
app.use("/user", userRoute);
app.use("/admin", adminRoute);

module.exports = app;
