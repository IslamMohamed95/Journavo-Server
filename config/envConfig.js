// configuration for which variable will be used depend on the case [Development / Production]
require("dotenv").config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});

module.exports = {
  port: process.env.PORT,
  dataBase: process.env.DATABASE,
  cloud_name: process.env.CLOUD_NAME,
  cloud_api_key: process.env.CLOUD_API_KEY,
  cloud_secret_key: process.env.CLOUD_SECRET_KEY,
};
