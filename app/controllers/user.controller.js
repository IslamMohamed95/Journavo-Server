const useModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const useerModel = require("../models/user.model");

class User {
  static registerUser = async (req, res) => {
    const { name, email, password, role, phone } = req.body;

    try {
      // Check if user already exists
      const existingUser = await useModel.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: "User already exists" });

      // Create new user
      const newUser = new useModel({
        name,
        email,
        password,
        role,
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

  static loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
      // 1. Check if user exists
      const user = await useerModel.findOne({ email });
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
}

module.exports = User;
