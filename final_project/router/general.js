const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    try {
      const userExists = await Promise.resolve(isValid(username));
      if (!userExists) {
        users.push({ username: username, password: password });
        return res
          .status(201)
          .json({ message: "User successfully registered. Now you can login" });
      } else {
        return res.status(409).json({ message: "User already exists!" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Registration failed" });
    }
  }
  return res.status(400).json({ message: "Username or password missing." });
});

public_users.get("/", async function (req, res) {
  try {
    const booksList = await Promise.resolve(books);
    res.status(200).json(booksList);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books" });
  }
});

public_users.get("/isbn/:isbn", async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await Promise.resolve(books[isbn]);
    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving book details" });
  }
});

public_users.get("/author/:author", async function (req, res) {
  const author = req.params.author;
  try {
    const keys = Object.keys(books);
    const filteredBooks = keys
      .filter((key) => books[key].author === author)
      .map((key) => ({ isbn: key, ...books[key] }));

    const result = await Promise.resolve(filteredBooks);
    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error filtering by author" });
  }
});

public_users.get("/title/:title", async function (req, res) {
  const title = req.params.title;
  try {
    const keys = Object.keys(books);
    const filteredBooks = keys
      .filter((key) =>
        books[key].title.toLowerCase().includes(title.toLowerCase())
      )
      .map((key) => ({ isbn: key, ...books[key] }));

    const result = await Promise.resolve(filteredBooks);
    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error filtering by title" });
  }
});

public_users.get("/review/:isbn", async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await Promise.resolve(books[isbn]);
    if (book) {
      res.status(200).json(book.reviews);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving reviews" });
  }
});

module.exports.general = public_users;
