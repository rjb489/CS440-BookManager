import express from 'express';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';

const router = express.Router();

// Define the Book schema and model
const bookSchema = new mongoose.Schema({
  title: String,
  name: String,
  content: String,
  genre: String,
  rating: Number,
  coverImage: String,
  creationTime: String,
});

const Book = mongoose.model('Book', bookSchema);

// Import UserProfile model (since we need it here)
import UserProfile from './userRoutes.js'; // Importing from userRoutes.js

// Set up storage for uploaded files using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Controller functions

// Display all books
router.get('/', async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      req.flash('error', 'You must be logged in to view books.');
      return res.redirect('/login');
    }

    const userProfile = await UserProfile.findById(user._id).populate('books');
    res.render('index.ejs', { bookLibrary: userProfile.books });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Show form to create a new book
router.get('/create', (req, res) => {
  const user = req.session.user;
  if (!user) {
    req.flash('error', 'You must be logged in to create books.');
    return res.redirect('/login');
  }
  res.render('create.ejs');
});

// Handle creation of a new book
router.post('/create', upload.single('coverImage'), async (req, res) => {
  try {
    const { title, name, genre, rating, content } = req.body;
    const coverImage = req.file ? req.file.filename : null;

    const user = req.session.user;
    const newBook = new Book({
      title,
      name,
      genre,
      rating,
      content,
      coverImage,
      creationTime: new Date().toLocaleString(),
    });

    const savedBook = await newBook.save();
    const userProfile = await UserProfile.findById(user._id);
    userProfile.books.push(savedBook._id);
    await userProfile.save();
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Display details of a specific book
router.get('/view/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId);
    res.render('view.ejs', { post: book });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Show form to edit a book
router.get('/edit/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId);
    res.render('edit.ejs', { post: book, postId: book._id });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Handle updating a book
router.post('/edit/:id', upload.single('coverImage'), async (req, res) => {
  try {
    const { title, name, genre, rating, content } = req.body;
    const coverImage = req.file ? req.file.filename : undefined;
    const bookId = req.params.id;

    const book = await Book.findById(bookId);

    book.title = title || book.title;
    book.name = name || book.name;
    book.genre = genre || book.genre;
    book.rating = rating || book.rating;
    book.content = content || book.content;

    if (coverImage) book.coverImage = coverImage;

    await book.save();
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Handle deleting a book
router.post('/delete/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    await Book.findByIdAndDelete(bookId);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

export default router;
