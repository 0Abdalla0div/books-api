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
        const result = await pool.query("SELECT * FROM books");
        return res.status(200).json(result.rows);
      } else {
        let book;
        if (!name) {
          book = await pool.query("SELECT * FROM books WHERE author = $1", [
            author,
          ]);
        } else if (!author) {
          book = await pool.query("SELECT * FROM books WHERE name = $1", [
            name,
          ]);
        } else {
          book = await pool.query(
            "SELECT * FROM books WHERE name = $1 AND author = $2",
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
      let book = await pool.query("SELECT * FROM books WHERE id = $1",
        [Id]
      )
      if (book.rows.length === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: "books not there",
        });
      } else {
        res.json(book.rows);
      }
    });

    router.post("/books", validatebook, async (req, res) => {
      let { name, author } = req.body;
      if (!name || !author)
        return res.status(400).json({
          error: "validation Error",
          message: "all values are needed",
        });
      const newbook = {
        id: id + 1,
        name,
        author,
      };
      Books.push(newbook);
      await WriteData(Books);
      res.status(201).json(newbook);
      id += 1;
    });

    router.delete("/books/:id", async (req, res) => {
      const id = Number(req.params.id);
      const bookindex = Books.findIndex((book) => book.id === id);
      if (bookindex === -1) {
        return res.status(404).json({
          error: "Not Found",
          message: "book was not found",
        });
      }
      const deletedbook = Books.splice(bookindex, 1);
      await WriteData(Books);
      res.json(deletedbook[0]);
    });

    router.put("/books/:id", validatebook, async (req, res) => {
      const id = Number(req.params.id);
      const book = Books.find((book) => book.id === id);
      if (!book) {
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
      book.name = name;
      book.author = author;
      await WriteData(Books);
      res.status(200).json(book);
    });

    router.patch("/books/:id", validatebook, async (req, res) => {
      const id = Number(req.params.id);
      const book = Books.find((book) => book.id === id);
      if (!book) {
        return res.status(404).json({
          error: "Not Found",
          message: "book not found",
        });
      }
      let { name, author } = req.body;
      if (author !== undefined) book.author = author;
      if (name !== undefined) book.name = name;
      await WriteData(Books);
      return res.json(book);
    });
    return router;
  }
}
module.exports = laodrouter;
