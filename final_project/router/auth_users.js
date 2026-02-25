const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  return validusers.length > 0;
};

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Nom d'utilisateur ou mot de passe manquant" });
  }

  if (authenticatedUser(username, password)) {

    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };

    return res.status(200).send("Utilisateur connecté avec succès");
  } else {
    return res.status(401).json({ message: "Identifiants invalides" });
  }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization['username'];
  const book = books[isbn];

  if (book) {
    if (review) {
      book.reviews[username] = review;
      return res.status(200).send(`L'avis de l'utilisateur ${username} pour l'ISBN ${isbn} a été ajouté/mis à jour.`);
    } else {
      return res.status(400).json({ message: "Le contenu de l'avis est vide." });
    }
  } else {
    return res.status(404).json({ message: "Livre non trouvé." });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization['username'];
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Livre non trouvé." });
  }

  if (book.reviews[username]) {
    delete book.reviews[username];
    return res.status(204).send(`L'avis de l'utilisateur ${username} pour l'ISBN ${isbn} a été supprimé.`);
  } else {
    return res.status(404).json({ message: "Aucun avis trouvé pour cet utilisateur sur ce livre." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
