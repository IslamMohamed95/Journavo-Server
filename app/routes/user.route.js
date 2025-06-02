const route = require("express").Router(),
  auth = require("../../middelware/auth"),
  {
    registerUser,
    loginUser,
    logoutUser,
  } = require("../controllers/user.controller");

// Add New Data
route.post("/new", registerUser);

//Login
route.post("/login", loginUser);

//logout
route.post("/logout", auth, logoutUser);

module.exports = route;
