// Code from Chat

const Book = require('./bookModel');
const User = require('./userModel');
const bcrypt = require('bcrypt');

// Home Page
exports.showHomePage = (req, res) => {
  res.redirect('/books');
};

// Book Controllers

// List all books
exports.listBooks = async (req, res) => {
  try {
    const books = await Book.find({});
    res.render('index', { books });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Show form to create a new book
exports.showCreateBookForm = (req, res) => {
  res.render('create');
};

// Create a new book
exports.createBook = async (req, res) => {
  try {
    const newBook = new Book(req.body);
    await newBook.save();
    res.redirect('/books');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// View a single book
exports.viewBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    res.render('view', { book });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Show form to edit a book
exports.showEditBookForm = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    res.render('edit', { book });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Update a book
exports.updateBook = async (req, res) => {
  try {
    await Book.findByIdAndUpdate(req.params.id, req.body);
    res.redirect(`/books/${req.params.id}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Delete a book
exports.deleteBook = async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.redirect('/books');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// User Controllers

// Show registration form
exports.showRegisterForm = (req, res) => {
  res.render('create-profile');
};

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    // Automatically log in the user after registration (optional)
    req.session.userId = newUser._id;
    res.redirect('/profile');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Show login form
exports.showLoginForm = (req, res) => {
  res.render('login');
};

// Log in a user
exports.loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).send('Invalid email or password');
    }
    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) {
      return res.status(401).send('Invalid email or password');
    }
    // Set session or token (depending on your authentication strategy)
    req.session.userId = user._id;
    res.redirect('/profile');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Log out a user
exports.logoutUser = (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.redirect('/login');
  });
};

// View user profile
exports.viewUserProfile = async (req, res) => {
  try {
    // Assuming you have a session middleware that sets req.session.userId
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/login');
    }
    res.render('profile', { user });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

/* 
Explanation:

Imports:

Book and User: Models imported from bookModel.js and userModel.js.
bcrypt: For password comparison (if not using methods defined in the model).
Home Page Controller:

Redirects to the list of books.
Book Controllers:

listBooks: Fetches all books and renders the index.ejs view.
showCreateBookForm: Renders the form to create a new book.
createBook: Saves a new book to the database and redirects to the books list.
viewBook: Fetches a single book by ID and renders the view.ejs view.
showEditBookForm: Fetches a book and renders the edit.ejs form.
updateBook: Updates an existing book and redirects to its detail page.
deleteBook: Deletes a book and redirects to the books list.
User Controllers:

showRegisterForm: Renders the registration form.
registerUser: Creates a new user, saves to the database, and redirects to the profile.
showLoginForm: Renders the login form.
loginUser: Authenticates the user and redirects to the profile.
logoutUser: Logs out the user by destroying the session.
viewUserProfile: Fetches the logged-in user's profile and renders the profile.ejs view.
Notes:

Session Management: The controllers assume that session management middleware is set up (e.g., express-session).
Error Handling: Errors are caught and sent as a 500 response with the error message.
Authentication Checks: For routes that require authentication (like viewing the profile), checks are made to ensure the user is logged in.
*/
