const express = require("express");
const router = express.Router();
const pool = require("../CoPoDestrputer.js");
router.post("/borrowings", async (req, res) => {
  const { user_id, book_id } = req.body;
  const activeBorrow = await pool.query(
    "SELECT * FROM borrowings WHERE book_id = $1 AND status = 'borrowed'",
    [book_id],
  );
  const status = activeBorrow.rows.length === 0 ? "borrowed" : "pending";
  try {
    const newBorrowing = await pool.query(
      "INSERT INTO borrowings (user_id,book_id,status) VALUES ($1,$2,$3) RETURNING *",
      [user_id, book_id, status],
    );
    return res.status(201).json(newBorrowing.rows[0]);
  } catch (err) {
    if (err.code === "23503") {
      return res.status(404).json({
        error: "Not Found",
        message: "user or book does not exist",
      });
    }
    throw err;
  }
});
router.patch("/borrowings/:id/return", async (req, res) => {
  const id = Number(req.params.id);
  const clint = await pool.connect();
  try {
    await clint.query("BEGIN");

    const updated = await clint.query(
      "UPDATE borrowings SET status = 'returned', returned_at = now() WHERE id = $1 AND status = 'borrowed' RETURNING *",
      [id],
    );

    if (updated.rows.length === 0) {
      await clint.query("ROLLBACK");
      return res.status(404).json({
        error: "Not Found",
        message: "no active borrowing with this id",
      });
    }
    const bookid = updated.rows[0].book_id;
    const nextpending = await clint.query(
      "SELECT * FROM borrowings WHERE book_id = $1 AND status = 'pending' ORDER BY borrowed_at ASC LIMIT 1",
      [bookid],
    );
    if (nextpending.rows.length > 0) {
      await clint.query(
        "UPDATE borrowings SET status = 'borrowed' WHERE id = $1",
        [nextpending.rows[0].id],
      );
    }
    await clint.query("COMMIT");
    return res.status(200).json(updated.rows[0]);
  } catch (err) {
    await clint.query("ROLLBACK");
    throw err;
  } finally {
    clint.release();
  }
});

module.exports = router;
