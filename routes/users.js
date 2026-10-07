const express = require("express");
const router = express.Router();
const pool = require("../CoPoDestrputer.js");
router.get("/users", async (req, res) => {
  let result = await pool.query("SELECT * FROM users");
  return res.status(200).json(result.rows);
});
router.post("/users", async (req, res) => {
  let { name, email } = req.body;
  if (name === undefined || email === undefined) {
    return res.status(400).json({
      error: "validation Error",
      message: "all values are needed",
    });
  }
  try {
    const newUser = await pool.query(
      "INSERT INTO users (name,email) VALUES ($1,$2) RETURNING *",
      [name, email],
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
module.exports = router;
