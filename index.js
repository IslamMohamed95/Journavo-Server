const app = require("./src/app"),
  { port } = require("./config/envConfig");

app.listen(port, () => {
  console.log(`✅ Server is running port: ${port}`);
});
