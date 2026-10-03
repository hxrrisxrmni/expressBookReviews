const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

// ⚠️ IMPORTANT: this is in-memory storage (lab requirement)
let users = [];

/**
 * Check if username already exists
 */
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

/**
 * Validate username + password
 */
const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

/**
 * REGISTER (optional usually in general.js but fine here if needed)
 */
regd_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: "User already exists"
    });
  }

  users.push({ username, password });

  return res.status(201).json({
    message: "User registered successfully"
  });
});

/**
 * LOGIN
 */
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      message: "Must provide username and password"
    });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      { username },
      "access",
      { expiresIn: "1h" }
    );

    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({
      message: "Login successful",
      token: accessToken
    });
  } else {
    return res.status(401).json({
      message: "Invalid credentials"
    });
  }
});

/**
 * MIDDLEWARE: check login
 */
const loginRequired = (req, res, next) => {
  if (req.session && req.session.authorization) {
    next();
  } else {
    return res.status(403).json({
      message: "User not logged in"
    });
  }
};

/**
 * ADD / UPDATE BOOK REVIEW
 * FINAL CORRECT ROUTE:
 * /customer/review/:isbn
 */
regd_users.put("/review/:isbn", loginRequired, (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({
      message: "Review text is required"
    });
  }

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: `Review added/updated for book ${isbn}`
  });
});

/**
 * DELETE REVIEW
 */
regd_users.delete("/review/:isbn", loginRequired, (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];

    return res.status(200).json({
      message: `Review deleted for book ${isbn}`
    });
  } else {
    return res.status(404).json({
      message: "No review found for this user"
    });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;