// imports
import express from 'express';
import mongoose from 'mongoose';
import 
{
    getAllBooks, getBookById, createBook, updateBook,
    deleteBook, getAllUsers, getUserById, createUser,
    updateUser, deleteUser
} 
from './controller.js';

// connect to the database
mongoose.connect('mongodb://localhost:27017/bookLibraryDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// constants
const router = express.Router();

//  book model
const bookSchema = new mongoose.Schema
({
    title: String, name: String, content: String,
    genre: String, rating: Number, coverImage: String,
    creationTime: String,
});
const Book = mongoose.model('Book', bookSchema);

// user model
const userProfileSchema = new mongoose.Schema
({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
});
const UserProfile = mongoose.model('UserProfile', userProfileSchema);

// book routes
router.get('/books', (req, res) => getAllBooks(req, res, Book));
router.get('/books/:id', (req, res) => getBookById(req, res, Book));
router.post('/books', (req, res) => createBook(req, res, Book));
router.put('/books/:id', (req, res) => updateBook(req, res, Book));
router.delete('/books/:id', (req, res) => deleteBook(req, res, Book));

// user routes
router.get('/users', (req, res) => getAllUsers(req, res, UserProfile));
router.get('/users/:id', (req, res) => getUserById(req, res, UserProfile));
router.post('/users', (req, res) => createUser(req, res, UserProfile));
router.put('/users/:id', (req, res) => updateUser(req, res, UserProfile));
router.delete('/users/:id', (req, res) => deleteUser(req, res, UserProfile));

// export router
export default router;
