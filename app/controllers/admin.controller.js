const adminModel = require("../models/admin.model");
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class Admin {
  static registerAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      const existingAdmin = await adminModel.findOne({ email });
      if (existingAdmin)
        return res.status(400).json({ message: "User already exists" });

      // Create new user
      const newAdmin = new adminModel({
        name,
        email,
        password,
      });

      await newAdmin.save();
      res
        .status(201)
        .send({ message: "User registered successfully", data: newAdmin });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Registration failed", error: error.message });
    }
  };
  static loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
      // 1. Check if user exists
      const admin = await adminModel.findOne({ email });
      if (!admin) return res.status(400).send({ message: "Invalid email " });

      // 2. Compare password
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch)
        return res.status(400).send({ message: "Invalid password" });

      // 3. Generate token
      const token = jwt.sign({ _id: admin._id }, "key", {
        expiresIn: "7d",
      });

      // 4. Store token in DB
      admin.tokens.push({ token });
      await admin.save();

      // 5. Return success response
      res.status(200).send({ API: true, data: admin, token: token });
    } catch (err) {
      res
        .status(500)
        .send({ API: false, message: "Server error", error: err.message });
    }
  };
  static logoutAdmin = async (req, res) => {
    try {
      req.admin.tokens = req.admin.tokens.filter((t) => t.token !== req.token);
      await req.admin.save();
      res.status(200).send({
        API: true,
        message: "Logged out from this device successfully",
      });
    } catch (e) {
      res.status(500).send({ API: false, error: e.message });
    }
  };
  static removeAdminOrUsers = async (req, res) => {
    try {
      const type = req.params.type;
      if (type === "users") {
        await userModel.deleteMany({}); // This deletes all users in the collection
      } else {
        await adminModel.deleteMany({}); // This deletes all admins in the collection
      }

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
  static getAllUsers = async (req, res) => {
    try {
      const users = await userModel.find();
      res.status(200).send({
        API: true,
        data: users,
      });
    } catch (e) {
      res.status(404).send({
        API: false,
        message: "No Data found !",
      });
    }
  };
}

module.exports = Admin;
