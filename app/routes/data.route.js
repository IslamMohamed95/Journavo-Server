const route = require("express").Router(),
  upload = require("../../config/multerConfig"),
  { newData, editData, getAllData } = require("../controllers/data.controller");

// Add New Data
route.post("/new", upload.single("img"), newData);

// //Edit Data
// route.post("/edit/:id", editData);

//Gett All Data
route.get("/all", getAllData);

module.exports = route;
