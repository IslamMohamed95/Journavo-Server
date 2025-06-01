const route = require("express").Router(),
  upload = require("../../config/multerConfig"),
  { newData } = require("../controllers/data.controller");

// Add new Data
route.post("/new", upload.single("img"), newData);

module.exports = route;
