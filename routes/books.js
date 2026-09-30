const express = require("express");
const router = express.Router();
const pool = require("../CoPoDestrputer.js");
const {
  WriteData,
  loaddata,
  validatebook,
} = require("../functions/filesUtil.js");
async function laodrouter() {
  const data = await loaddata();
  if (!data) {
    throw new Error("Failed to load data");
  } else {
    let Books = data.book;
    let id = data.ID;
    router.get("/books", async (req, res) => {
      let { name, author } = req.query;
      if (!name && !author) {
        const result = await pool.query("SELECT * FROM testbooks");
        return res.status(200).json(result.rows);
      } else {
        let book;
        if (!name) {
          book = await pool.query("SELECT * FROM testbooks WHERE author = $1", [
            author,
          ]);
        } else if (!author) {
          book = await pool.query("SELECT * FROM testbooks WHERE name = $1", [
            name,
          ]);
        } else {
          book = await pool.query(
            "SELECT * FROM testbooks WHERE name = $1 AND author = $2",
            [name, author],
          );
        }
        if (book.rows.length === 0) {
          return res.status(200).json([]);
        }
        return res.status(200).json(book.rows);
      }
    });
    router.get("/books/:id", async (req, res) => {
      let Id = Number(req.params.id);
      let book = await pool.query("SELECT * FROM testbooks WHERE id = $1", [
        Id,
      ]);
      if (book.rows.length === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: "books not there",
        });
      } else {
        res.json(book.rows[0]);
      }
    });

    router.post("/books", validatebook, async (req, res) => {
      let { name, author } = req.body;
      if (!name || !author)
        return res.status(400).json({
          error: "validation Error",
          message: "all values are needed",
        });
      const might = await pool.query(
        "SELECT * FROM testbooks WHERE name = $1 AND author = $2",
        [name, author],
      );
      if (might.rows.length === 0) {
        const newbook = await pool.query(
          "INSERT INTO testbooks (name,author) VALUES ($1,$2) RETURNING *",
          [name, author],
        );
        return res.status(201).json(newbook.rows[0]);
      }
      res.status(400).json({
        error: "book already exsist",
        message: "change the book",
      });
    });

    router.delete("/books/:id", async (req, res) => {
      const id = Number(req.params.id);
      const bookindex = await pool.query(
        "SELECT * FROM testbooks WHERE id = $1",
        [id],
      );
      if (bookindex.rows.length === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: "book was not found",
        });
      }
      await pool.query("DELETE FROM testbooks WHERE id = $1", [id]);

      res.json(bookindex.rows[0]);
    });

    router.put("/books/:id", validatebook, async (req, res) => {
      const id = Number(req.params.id);
      const bookindex = await pool.query(
        "SELECT * FROM testbooks WHERE id = $1",
        [id],
      );
      if (bookindex.rows.length === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: "book was not found",
        });
      }
      let { name, author } = req.body;
      if (!name || !author)
        return res.status(400).json({
          error: "validation error",
          message: "all values are needed",
        });
      let ubdbook = await pool.query(
        "UPDATE testbooks SET name = $1 , author = $2 WHERE id = $3 RETURNING *",
        [name, author, id],
      );
      res.status(200).json(ubdbook.rows[0]);
    });

    router.patch("/books/:id", validatebook, async (req, res) => {
      const id = Number(req.params.id);
      const bookindex = await pool.query(
        "SELECT * FROM testbooks WHERE id = $1",
        [id],
      );
      if (bookindex.rows.length === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: "book was not found",
        });
      }
      let { name, author } = req.body;
      if (author !== undefined)
        await pool.query("UPDATE testbooks SET author = $1 WHERE id = $2", [
          author,
          id,
        ]);
      if (name !== undefined)
        await pool.query("UPDATE testbooks SET name = $1 WHERE id = $2", [
          name,
          id,
        ]);
      let updbook = await pool.query("SELECT * FROM testbooks WHERE id = $1", [
        id,
      ]);
      return res.json(updbook.rows[0]);
    });
    return router;
  }
}
module.exports = laodrouter;
