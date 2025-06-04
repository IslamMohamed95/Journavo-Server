const route = require("express").Router(),
  auth = require("../../middelware/auth"),
  {
    registerUser,
    loginUser,
    logoutUser,
    addWishList,
    addToCart,
    removeItemFromCart,
    removeUsers,
  } = require("../controllers/user.controller");

// Add New Data
route.post("/new", registerUser);
//Clear All Users
route.post("/clearAll", removeUsers);
//Login
route.post("/login", loginUser);
//logout
route.post("/logout", auth, logoutUser);

//Add to wishlist
route.post("/wishList/:id", auth, addWishList);
//Remove Item from the wishlist
route.post("/removeItemFromwishlist/:id", auth, removeItemFromCart);
//Add To Cart
route.post("/cart/:id", auth, addToCart);

module.exports = route;
