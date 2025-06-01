const mongoose = require("mongoose"),
  { dataBase } = require("../../config/envConfig");

mongoose
  .connect(dataBase)
  .then((_) => console.log("✅ Database connected successfully !"))
  .catch((e) => console.log(`❌ ${e.message}`));
