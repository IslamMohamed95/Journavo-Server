const route = require("express").Router(),
  auth = require("../../middelware/auth"),
  {
    registerUser,
    loginUser,
    logoutUser,
    addWishList,
    removeItemFromCart,
    removeItemFromWishList,
    booking,
  } = require("../controllers/user.controller");

// Add New Data
route.post("/new", registerUser);

//Login
route.post("/login", loginUser);
//logout
route.post("/logout", auth("user"), logoutUser);

//Add to wishlist
route.post("/wishList/:id", auth("user"), addWishList);
//Remove Item from the wishlist
route.post("/removeItemFromwishlist/:id", auth("user"), removeItemFromWishList);
//Remove Item from the cart
route.post("/removeItemFromCart/:id", auth("user"), removeItemFromCart);
//Add Custom trip
route.post("/booking/:id", auth("user"), booking);

module.exports = route;
