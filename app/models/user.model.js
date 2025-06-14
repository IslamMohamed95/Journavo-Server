const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, default: "user" },
    wishlist: [],
    cart: [],
    totalPrice: { type: Number, default: 0 },
    tokens: [{ token: { type: String, required: true } }],
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const userModel = mongoose.model("Users", userSchema);
module.exports = userModel;
