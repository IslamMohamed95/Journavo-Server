const jwt = require("jsonwebtoken");
const userModel = require("../app/models/user.model");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "key");
    const user = await userModel.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) throw new Error();

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ message: "Please authenticate" });
  }
};

module.exports = auth;
