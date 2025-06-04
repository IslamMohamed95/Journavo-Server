const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dataModel = require("../models/data.model");

class User {
  static registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
      // Check if user already exists
      const existingUser = await userModel.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: "User already exists" });

      // Create new user
      const newUser = new userModel({
        name,
        email,
        password,
        role: "user",
        phone,
        wishlist: [],
        cart: [],
      });

      await newUser.save();
      res
        .status(201)
        .send({ message: "User registered successfully", userId: newUser });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Registration failed", error: error.message });
    }
  };

  static removeUsers = async (req, res) => {
    try {
      await userModel.deleteMany({}); // This deletes all users in the collection
      res.status(200).send({
        API: true,
        message: "All users have been cleared successfully",
      });
    } catch (e) {
      res.status(500).send({
        API: true,
        message: "Failed to clear users",
      });
    }
  };

  static loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
      // 1. Check if user exists
      const user = await userModel.findOne({ email });
      if (!user) return res.status(400).send({ message: "Invalid email " });

      // 2. Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).send({ message: "Invalid password" });

      // 3. Generate token
      const token = jwt.sign({ _id: user._id }, "key", {
        expiresIn: "7d",
      });

      // 4. Store token in DB
      user.tokens.push({ token });
      await user.save();

      // 5. Return success response
      res.status(200).send({ API: true, data: user, token: token });
    } catch (err) {
      res
        .status(500)
        .send({ API: false, message: "Server error", error: err.message });
    }
  };

  static logoutUser = async (req, res) => {
    try {
      req.user.tokens = req.user.tokens.filter((t) => t.token !== req.token);
      await req.user.save();
      res.status(200).send({
        API: true,
        message: "Logged out from this device successfully",
      });
    } catch (e) {
      res
        .status(500)
        .send({ API: false, message: "Logout failed", error: e.message });
    }
  };

  static addWishList = async (req, res) => {
    try {
      // Get the user from req.user (assumes middleware has decoded the token and added user info)
      const userId = req.user._id;

      // Find the user from the DB
      const user = await userModel.findById(userId);
      if (!user)
        return res.status(404).send({ API: false, message: "User not found" });

      // Get the product by ID from the request params
      const product = await dataModel.findById(req.params.id);
      if (!product)
        return res
          .status(404)
          .send({ API: false, message: "Product not found" });

      // Check if product already exists in wishlist
      const exists = user.wishlist.includes(product._id);
      if (exists) {
        return res
          .status(400)
          .send({ API: false, message: "Product already in wishlist" });
      }

      // Add product to user's wishlist
      user.wishlist.push(product);
      await user.save();

      res.status(200).send({
        API: true,
        message: "Product added to wishlist",
        wishlist: user.wishlist,
      });
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .send({ API: false, message: "Failed to add to wishlist" });
    }
  };

  static removeItemFromCart = async (req, res) => {
    try {
      const userId = req.user._id; // get user id from req.user
      const productId = req.params.id;

      if (!productId) {
        return res.status(400).send({
          API: false,
          message: "Product ID is required",
        });
      }

      // Fetch the full user document from DB
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).send({
          API: false,
          message: "User not found",
        });
      }

      // Remove the productId from wishlist
      user.wishlist = user.wishlist.filter(
        (id) => id._id.toString() !== productId
      );

      await user.save();

      res.status(200).send({
        API: true,
        message: "Item removed from wishlist successfully",
        data: user,
      });
    } catch (e) {
      res.status(500).send({
        API: false,
        message: "Failed to remove item!",
        error: e.message,
      });
    }
  };

  static addToCart = async (req, res) => {
    try {
      const userId = req.user._id;

      const user = await userModel.findById(userId);
      if (!user)
        return res.status(404).send({ API: false, message: "User not found" });

      const product = await dataModel.findById(req.params.id);
      if (!product)
        return res
          .status(404)
          .send({ API: false, message: "Product not found" });

      const productIdStr = product._id.toString();

      // Initialize totalPrice if undefined
      if (typeof user.totalPrice !== "number") {
        user.totalPrice = 0;
      }

      // Step 1: Check if the product exists in wishlist
      const wasInWishlist = user.wishlist.some(
        (item) => item._id.toString() === productIdStr
      );

      if (wasInWishlist) {
        // Remove it from wishlist
        user.wishlist = user.wishlist.filter(
          (item) => item._id.toString() !== productIdStr
        );
      }

      // Step 2: Check if the product already exists in cart
      const existsInCart = user.cart.some(
        (item) => item._id.toString() === productIdStr
      );

      if (existsInCart) {
        return res.status(400).send({
          API: false,
          message: "Product already in the cart",
        });
      }

      // Step 3: Add full product object to cart
      user.cart.push(product);

      // Step 4: Update totalPrice
      user.totalPrice += Number(product.price);

      await user.save();

      res.status(200).send({
        API: true,
        message: wasInWishlist
          ? "Product moved from wishlist to cart"
          : "Product added to cart",
        cart: user.cart,
        wishlist: user.wishlist,
        totalPrice: user.totalPrice,
      });
    } catch (e) {
      console.error("Add to cart error:", e);
      res.status(500).send({
        API: false,
        message: "Adding product to the cart failed!",
      });
    }
  };
}

module.exports = User;
