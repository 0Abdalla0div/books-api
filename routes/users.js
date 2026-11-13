const express = require("express");
const router = express.Router();
const pool = require("../CoPoDestrputer.js");
const bcrypt = require("bcrypt");
router.get("/users", async (req, res) => {
  let result = await pool.query("SELECT * FROM users");
  return res.status(200).json(result.rows);
});
router.post("/users", async (req, res) => {
  let { name, email, password } = req.body;
  if (
    name === undefined ||
    email === undefined ||
    password === undefined ||
    password.length < 8
  ) {
    return res.status(400).json({
      error: "validation Error",
      message: "all values are needed",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const newUser = await pool.query(
      "INSERT INTO users (name,email,password) VALUES ($1,$2,$3) RETURNING *",
      [name, email, hashedPassword],
    );
    return res.status(201).json(newUser.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({
        error: "Validation Error",
        message: "This email is already registered",
      });
    }
    throw err;
  }
});
router.post("/user", async (req, res) => {
  let { email, password } = req.body;
  try {
    let user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    let match;
    if (user.rows.length !== 0) {
      match = await bcrypt.compare(password, user.rows[0].password);
    }

    if (user.rows.length === 0 || match === false) {
      return res.status(400).json({
        error: "Validation Error",
        message: "wrong email or password",
      });
    }
    return res.status(200).json({ message: "Logged in successfully" });
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
