const mongoose = require("mongoose");

const Data = new mongoose.Schema({
  image: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ["Hotels", "Transportation", "Trips"],
  },
  title: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: String, required: true },
  details: [
    {
      checkIn: { type: String },
      checkOut: { type: String },
      guests: { type: Number },
      travelClass: { type: String },
      requests: { type: String },
    },
  ],
});

const DataModel = mongoose.model("Categories", Data);
module.exports = DataModel;
