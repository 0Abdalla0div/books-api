const express = require("express");
const booksroutes = require("./routes/books");
const usersroutes = require("./routes/users");
const borrowingsroutes = require("./routes/borrowings");
const app = express();
app.use(express.json());
  const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  };
  app.use(logger);
  app.use("/api", booksroutes);
  app.use("/api", usersroutes);
  app.use("/api", borrowingsroutes);
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
module.exports = { app };
