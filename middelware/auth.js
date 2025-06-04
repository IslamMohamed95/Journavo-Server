const jwt = require("jsonwebtoken");
const userModel = require("../app/models/user.model");
const adminModel = require("../app/models/admin.model");

const auth = () => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization").replace("Bearer ", "");
      const decode = jwt.verify(token, "key");
      const admin = await adminModel.findOne({
        _id: decode._id,
        "tokens.token": token,
      });
      const user = await userModel.findOne({
        _id: decode._id,
        "tokens.token": token,
      });
      req.user = user;
      req.admin = admin;
      req.token = token;
      next();
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        message: e.message,
      });
    }
  };
};

module.exports = auth;
