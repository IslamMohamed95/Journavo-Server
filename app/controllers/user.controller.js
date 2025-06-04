const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dataModel = require("../models/data.model");
const adminModel = require("../models/admin.model");

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

  static getClient = async (req, res) => {
    try {
      let client = await userModel.findById(req.params.id);
      if (!client) client = await adminModel.findById(req.params.id);
      res.status(200).send({
        API: true,
        data: client.role,
      });
    } catch (e) {
      res.status(500).send({
        API: false,
        message: e.message,
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
        data: user,
      });
    } catch (e) {
      console.error(e);
      res
        .status(500)
        .send({ API: false, message: "Failed to add to wishlist" });
    }
  };

  static removeItemFromWishList = async (req, res) => {
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

  static removeItemFromCart = async (req, res) => {
    try {
      const user = req.user; // get user id from req.user
      const productId = req.params.id;

      if (!productId) {
        return res.status(400).send({
          API: false,
          message: "Product ID is required",
        });
      }

      // Remove the productId from cart
      user.cart = user.cart.filter((id) => id._id.toString() !== productId);

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

  static booking = async (req, res) => {
    try {
      const user = req.user; // assuming this is a populated User model document
      const tripData = req.body; // trip details to add to details array

      const dataId = await dataModel.findById(req.params.id);
      if (!dataId) {
        return res.status(404).send({ API: false, message: "Trip not found" });
      }

      // Add trip details
      dataId.details.push(tripData);
      // Update totalPrice
      user.totalPrice = (user.totalPrice || 0) + (Number(dataId.price) || 0);
      await dataId.save();

      // Remove from wishlist if exists
      const wishlistIndex = user.wishlist.findIndex(
        (id) => id._id.toString() === dataId._id.toString()
      );
      if (wishlistIndex !== -1) {
        user.wishlist.splice(wishlistIndex, 1); // remove the item
      }

      // Add to cart
      user.cart.push(dataId); // use only the ID for consistency
      await user.save();
      // ❗ Now clear details array and save again
      dataId.details = [];
      await dataId.save();
      res.status(200).send({
        API: true,
        data: user,
      });
    } catch (e) {
      console.error(e);
      res.status(500).send({ API: false, message: "Failed to add a trip!" });
    }
  };
}

module.exports = User;
