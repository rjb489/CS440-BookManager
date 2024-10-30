// imports
import express from 'express';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';

// constants
const router = express.Router();
const bookSchema = new mongoose.Schema(
{
  title: String, name: String, content: String, genre: String,
  rating: Number, coverImage: String, creationTime: String,
});
const Book = mongoose.model('Book', bookSchema);

// Import user js
import UserProfile from './userRoutes.js'; 

// set up storage
const storage = multer.diskStorage(
{
  destination: (req, file, cb) => 
  {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) =>
  {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// get index.ejs 
router.get('/', async (req, res) => 
{
    // make sure user is logged in to view books
    const user = req.session.user;
    if (!user) 
    {
        req.flash('error', 'You must be logged in to view books.');
        return res.redirect('/login');
    }
    
    // get the user profile if there is one
    const userProfile = await UserProfile.findById(user._id).populate('books');
    res.render('index.ejs', { bookLibrary: userProfile.books });

});

// get reate.ejs
router.get('/create', (req, res) => 
{
    // make sure user is logged in
    const user = req.session.user;
    if (!user) 
    {
        req.flash('error', 'You must be logged in to create books.');
        return res.redirect('/login');
    }
    res.render('create.ejs');
});

// post create.ejs
router.post('/create-form', upload.single('coverImage'), async (req, res) => 
{
    // get the information
    const { title, name, genre, rating, content } = req.body;
    const coverImage = req.file ? req.file.filename : null;

    // make sure user is logged in and 
    const user = req.session.user;
    const newBook = new Book
    ({
        title, name, genre, rating, content,
        coverImage, creationTime: new Date().toLocaleString(),
    });

    // save book to database
    const savedBook = await newBook.save();
    const userProfile = await UserProfile.findById(user._id);

    // add the book to the array
    userProfile.books.push(savedBook._id); 
    await userProfile.save();
    res.redirect('/');
});

// get view.ejs
router.get('/view/:id', async (req, res) => 
{
    // get the information
    const user = req.session.user;
    const bookId = req.params.id;
    const book = await Book.findById(bookId);

    // show the information of the book
    const userProfile = await UserProfile.findById(user._id).populate('books');
    res.render('view.ejs', { post: book });
});

// get edit.ejs
router.get('/edit/:id', async (req, res) => 
{
    // get information
    const user = req.session.user;
    const bookId = req.params.id;
    const book = await Book.findById(bookId);

    // populate the edit screen
    const userProfile = await UserProfile.findById(user._id).populate('books');
    res.render('edit.ejs', { post: book, postId: book._id }); 
});

// post edit.ejs
router.post('/edit-form/:id', upload.single('coverImage'), async (req, res) => 
{
    // get information
    const { title, name, genre, rating, content } = req.body;
    const coverImage = req.file ? req.file.filename : undefined;
    const user = req.session.user;
    const bookId = req.params.id;

    // add book to database
    const book = await Book.findById(bookId);
    const userProfile = await UserProfile.findById(user._id).populate('books');

    // add updated information
    book.title = title || book.title;
    book.name = name || book.name;
    book.genre = genre || book.genre;
    book.rating = rating || book.rating;
    book.content = content || book.content;

    // there may or may not be cover image
    if (coverImage) book.coverImage = coverImage;

    // load new information
    await book.save();
    res.redirect('/');
});

// post delete.ejs
router.post('/delete/:id', async (req, res) => 
{
    // get information
    const user = req.session.user;
    const bookId = req.params.id;
    const book = await Book.findById(bookId);

    // delete book from array and database
    const userProfile = await UserProfile.findById(user._id).populate('books');
    await Book.findByIdAndDelete(bookId);
    res.redirect('/');
});

export default router;

