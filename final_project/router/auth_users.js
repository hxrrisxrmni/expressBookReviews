const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
//Use the filters function to filter out the name
let userswithsamename = users.filter((user) => user.username === username)

if (userswithsamename.length>0) {
    return true
} else {
    return false
}
}

const authenticatedUser = (username,password)=>{
    //USE FILTERS TO FILTER OUT !!!
    let validUser = users.filter(
        (user) => user.username === username && user.password === password);

    if (validUser.length>0) {
        return true
    } else {
        return false
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Must put username and password"})
  }

  if (authenticatedUser(username, password)){

    let accessToken = jwt.sign({data: password}, "access", {expiresIn: 60*60})

    //after generating accesstoken, we need to store it in a session
    req.session.authorization = {
        accessToken,
        username
    };

    return res.status(200).json({message: "User successfully logged in"})
} else {
    return res.status(404).json({message: "Invalid login"})
}
  }
);

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization['username'];

  //Check if the book exists in our database 
  if (books[isbn]) {

    books[isbn].reviews[username] = review;
    return res.status(200).json({
        message: `The review for the book ${isbn} has been updated`
  });
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

});
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization['username'];
  
    // 1. Check if the book exists in the database
    if (books[isbn]) {
      let bookReviews = books[isbn].reviews;
  
      // 2. Check if this specific user has posted a review for this book
      if (bookReviews[username]) {
        // Delete only this user's review key from the reviews object
        delete bookReviews[username];
  
        return res.status(200).json({
          message: `Review for ISBN ${isbn} posted by user '${username}' deleted successfully.`
        });
      } else {
        return res.status(404).json({
          message: `No review found for ISBN ${isbn} under user '${username}'.`
        });
      }
    } else {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
