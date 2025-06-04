const route = require("express").Router(),
  auth = require("../../middelware/auth"),
  {
    registerUser,
    loginUser,
    logoutUser,
    addWishList,
    removeItemFromCart,
    removeUsers,
    removeItemFromWidhList,
    booking,
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
//Remove Item from the cart
route.post("/removeItemFromCart/:id", auth, removeItemFromWidhList);

//Add Custom trip
route.post("/booking/:id", auth, booking);

module.exports = route;
