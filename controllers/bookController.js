// controllers/bookController.js

const bookService = require('../services/bookService');

// Display all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await bookService.getAllBooks();
    res.render('index', { books });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Display a single book's details
exports.getBookById = async (req, res) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    res.render('view', { book });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Show form to create a new book
exports.showCreateForm = (req, res) => {
  res.render('create');
};

// Handle creation of a new book
exports.createBook = async (req, res) => {
  try {
    await bookService.createBook(req.body);
    res.redirect('/books');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Show form to edit a book
exports.showEditForm = async (req, res) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    res.render('edit', { book });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Handle updating a book
exports.updateBook = async (req, res) => {
  try {
    await bookService.updateBook(req.params.id, req.body);
    res.redirect(`/books/${req.params.id}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Handle deleting a book
exports.deleteBook = async (req, res) => {
  try {
    await bookService.deleteBook(req.params.id);
    res.redirect('/books');
  } catch (error) {
    res.status(500).send(error.message);
  }
};
