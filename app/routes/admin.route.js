const route = require("express").Router(),
  auth = require("../../middelware/auth"),
  {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    getAllUsers,
    removeAdminOrUsers,
  } = require("../controllers/admin.controller");

// Add New Admin
route.post("/new", registerAdmin);
//Login
route.post("/login", loginAdmin);
//logout
route.post("/logout", auth("admin"), logoutAdmin);
//Get All Users
route.get("/all", auth("admin"), getAllUsers);
//Clear All Admins or Users
route.post("/clearAll/:type", auth("admin"), removeAdminOrUsers);

module.exports = route;
