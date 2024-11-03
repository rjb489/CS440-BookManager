// Code from Chat!

const express = require('express');
const router = express.Router();
const controllers = require('./controllers');

// Home page
router.get('/', controllers.showHomePage);

// Book routes
router.get('/books', controllers.listBooks);
router.get('/books/new', controllers.showCreateBookForm);
router.post('/books/new', controllers.createBook);
router.get('/books/:id', controllers.viewBook);
router.get('/books/:id/edit', controllers.showEditBookForm);
router.post('/books/:id/edit', controllers.updateBook);
router.post('/books/:id/delete', controllers.deleteBook);

// User routes
router.get('/register', controllers.showRegisterForm);
router.post('/register', controllers.registerUser);
router.get('/login', controllers.showLoginForm);
router.post('/login', controllers.loginUser);
router.get('/logout', controllers.logoutUser);
router.get('/profile', controllers.viewUserProfile);

// Export the router
module.exports = router;

/*
Explanation:

Imports:

express: For routing.
controllers: Importing all controller functions from controllers.js.
Route Definitions:

Home Page:
router.get('/', controllers.showHomePage);
Book Routes:
Listing all books, creating a new book, viewing, editing, and deleting a book.
User Routes:
Registration, login, logout, and viewing the user profile.
Exporting the Router:

Makes the router available to be used in app.js.
*/