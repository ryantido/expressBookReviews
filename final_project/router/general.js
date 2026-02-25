const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(201).json({ message: "Utilisateur enregistré avec succès." });
    } else {
      return res.status(409).json({ message: "L'utilisateur existe déjà !" });
    }
  }
  return res.status(400).json({ message: "Nom d'utilisateur ou mot de passe manquant." });
});

public_users.get('/', function (req, res) {
  const getBooks = new Promise((resolve) => {
    resolve(books);
  });
  getBooks.then((booksList) => {
    res.status(200).json(booksList);
  });
});

public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const getBook = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Livre non trouvé");
    }
  });

  getBook
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json({ message: err }));
});

public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const getBooksByAuthor = new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    const filteredBooks = keys
      .filter(key => books[key].author === author)
      .map(key => ({ isbn: key, ...books[key] }));

    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject("Aucun livre trouvé pour cet auteur");
    }
  });

  getBooksByAuthor
    .then((data) => res.status(200).json(data))
    .catch((err) => res.status(404).json({ message: err }));
});

public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const getBooksByTitle = new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    const filteredBooks = keys
      .filter(key => books[key].title.toLowerCase().includes(title.toLowerCase()))
      .map(key => ({ isbn: key, ...books[key] }));

    if (filteredBooks.length > 0) {
      resolve(filteredBooks);
    } else {
      reject("Aucun livre trouvé avec ce titre");
    }
  });

  getBooksByTitle
    .then((data) => res.status(200).json(data))
    .catch((err) => res.status(404).json({ message: err }));
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Livre non trouvé" });
  }
});

module.exports.general = public_users;