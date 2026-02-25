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
      return res.status(200).json({ message: "Utilisateur enregistré avec succès. Vous pouvez maintenant vous connecter." });
    } else {
      return res.status(404).json({ message: "L'utilisateur existe déjà !" });
    }
  }
  return res.status(404).json({ message: "Impossible d'enregistrer l'utilisateur : nom d'utilisateur ou mot de passe manquant." });
});


// Get the book list available in the shop
public_users.get('/', function (req, res) {
  //Write your code here
  return res.status(300).json({ books });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn]
  //Write your code here
  return res.status(300).json({ book });
});

// Get book details based on author
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

// Get all books based on title
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

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Livre non trouvé pour cet ISBN" });
  }
});

module.exports.general = public_users;
