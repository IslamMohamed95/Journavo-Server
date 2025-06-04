const route = require("express").Router(),
  upload = require("../../config/multerConfig"),
  { newData, getAllData } = require("../controllers/data.controller");

// Add New Data
route.post("/new", upload.single("img"), newData);

//Get All Data
route.get("/all", getAllData);

module.exports = route;
