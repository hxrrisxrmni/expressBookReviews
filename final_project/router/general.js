const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// User Registration Route
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Error registering: Username and password required!" });
  }

  // If isValid returns false, the username is available for registration
  if (!isValid(username)) {
    users.push({ "username": username, "password": password });
    return res.status(200).json({ message: "User successfully registered!" });
  } else {
    return res.status(404).json({ message: "User already exists" });
  }
});

// Task 10: Get the list of books available in the shop using Async/Await
public_users.get('/', async function (req, res) {
  try {
    const getBooks = new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      } else {
        reject("No books found");
      }
    });

    const bookList = await getBooks;
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

// Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("No books found based on ISBN");
    }
  });

  getBookByISBN
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

// Task 12: Get book details based on author using Async/Await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const getBooksByAuthor = new Promise((resolve, reject) => {
      const allBooks = Object.values(books);
      const matchingBooks = allBooks.filter(
        (book) => book.author.toLowerCase() === author.toLowerCase()
      );

      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("No books found for author");
      }
    });

    const matchingBooks = await getBooksByAuthor;
    return res.status(200).json(matchingBooks);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Task 13: Get book details based on title using Promises
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  const getBooksByTitle = new Promise((resolve, reject) => {
    const allBooks = Object.values(books);
    const matchingBooks = allBooks.filter(
      (book) => book.title.toLowerCase() === title.toLowerCase()
    );

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject("No books found for the title");
    }
  });

  getBooksByTitle
    .then((matchingBooks) => {
      return res.status(200).json(matchingBooks);
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

// Task 5: Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book review is not found" });
  }
});

module.exports.general = public_users;