const express = require("express");
const startruter = require("./routes/books");
async function createapp() {
  const app = express();
  let broutes;
  try {
    broutes = await startruter();
  } catch (err) {
    throw new Error(
      `Failed to load routes error: ${err.message}. Server not started.`,
    );
  }
  app.use(express.json());
  const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  };
  app.use(logger);
  app.use("/api", broutes);
  app.get("/", (req, res) => {
    res.send("hello");
  });
  app.get("/home", (req, res) => {
    res.send("youre home");
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
      error: "internal server error",
      message: "somthing went wrong",
    });
  });
  return app;
}
module.exports = { createapp };
