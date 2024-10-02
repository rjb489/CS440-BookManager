import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';
import session from 'express-session';
import flash from 'express-flash';

// constants
const app = express();
const port = 8080;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/bookLibraryDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// Define the schema for books
const bookSchema = new mongoose.Schema({
    title: String,
    name: String,
    content: String,
    genre: String,
    rating: Number,
    coverImage: String,
    creationTime: String,
});

// Define the schema for user profiles
const userProfileSchema = new mongoose.Schema({
    username: String,
    password: String,
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }] // Reference to the Book model
});

// Create models based on the schemas
const Book = mongoose.model('Book', bookSchema);
const UserProfile = mongoose.model('UserProfile', userProfileSchema);

// Set up storage for uploaded files using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // unique file name
    }
});

// Set up multer for handling file uploads
const upload = multer({ storage: storage });

app.use(session({
    secret: 'your_secret_key', // Replace with a secure key
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

// Setting up the ejs and url
app.set('view engine', 'ejs');
app.use('/static', express.static('static'));
app.use('/uploads', express.static('uploads')); 
app.use(bodyParser.urlencoded({ extended: true }));

// HOMEPAGE - Display all books for the logged-in user
app.get('/', async (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash('error', 'You must be logged in to view books.');
        return res.redirect('/login');
    }

    try {
        const userProfile = await UserProfile.findById(user._id).populate('books');
        res.render('index.ejs', { bookLibrary: userProfile.books });
    } catch (err) {
        console.error('Error retrieving books:', err); // Log error for debugging
        res.status(500).send('Error retrieving books');
    }
});

// CREATE FORM - Render form to create a new book
app.get('/create', (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash('error', 'You must be logged in to create books.');
        return res.redirect('/login');
    }

    res.render('create.ejs');
});

// POST /create-form - Add a new book to the database
app.post('/create-form', upload.single('coverImage'), async (req, res) => {
    const { title, name, genre, rating, content } = req.body;
    const coverImage = req.file ? req.file.filename : null;

    const user = req.session.user;
    if (!user) {
        req.flash('error', 'You must be logged in to create books.');
        return res.redirect('/login');
    }

    try {
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
        userProfile.books.push(savedBook._id); // Add book to user's books array
        await userProfile.save();

        res.redirect('/');
    } catch (err) {
        console.error('Error saving book:', err); // Log error for debugging
        res.status(500).send('Error saving book');
    }
});

// VIEW - Render the details of a specific book for the logged-in user
app.get('/view/:id', async (req, res) => {
    const user = req.session.user;
    const bookId = req.params.id;

    if (!user) {
        req.flash('error', 'You must be logged in to view books.');
        return res.redirect('/login');
    }

    // Validate the book ID
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return res.status(400).send('Invalid book ID');
    }

    try {
        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).send('Book not found');
        }

        // Compare ObjectIds as strings
        const userProfile = await UserProfile.findById(user._id).populate('books');
        if (userProfile.books.some(b => b._id.toString() === book._id.toString())) {
            res.render('view.ejs', { post: book });
        } else {
            res.status(403).send('You do not have permission to view this book.');
        }
    } catch (err) {
        console.error('Error retrieving book:', err);
        res.status(500).send('Error retrieving book');
    }
});

// EDIT FORM - Render the edit form for a specific book
app.get('/edit/:id', async (req, res) => {
    const user = req.session.user;
    const bookId = req.params.id;

    if (!user) {
        req.flash('error', 'You must be logged in to edit books.');
        return res.redirect('/login');
    }

    // Validate the book ID
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return res.status(400).send('Invalid book ID');
    }

    try {
        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).send('Book not found');
        }

        // Compare ObjectIds as strings
        const userProfile = await UserProfile.findById(user._id).populate('books');
        if (userProfile.books.some(b => b._id.toString() === book._id.toString())) {
            res.render('edit.ejs', { post: book, postId: book._id }); // Pass postId to the view
        } else {
            res.status(403).send('You do not have permission to edit this book.');
        }
    } catch (err) {
        console.error('Error retrieving book:', err);
        res.status(500).send('Error retrieving book');
    }
});

// POST /edit-form/:id - Update an existing book
app.post('/edit-form/:id', upload.single('coverImage'), async (req, res) => {
    const { title, name, genre, rating, content } = req.body;
    const coverImage = req.file ? req.file.filename : undefined;

    const user = req.session.user;
    const bookId = req.params.id;

    if (!user) {
        req.flash('error', 'You must be logged in to edit books.');
        return res.redirect('/login');
    }

    // Validate the book ID
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return res.status(400).send('Invalid book ID');
    }

    try {
        const book = await Book.findById(bookId);

        const userProfile = await UserProfile.findById(user._id).populate('books');
        if (!book || !userProfile.books.some(b => b._id.toString() === book._id.toString())) {
            return res.status(403).send('You do not have permission to edit this book.');
        }

        book.title = title || book.title;
        book.name = name || book.name;
        book.genre = genre || book.genre;
        book.rating = rating || book.rating;
        book.content = content || book.content;
        if (coverImage) book.coverImage = coverImage;

        await book.save();
        res.redirect('/');
    } catch (err) {
        console.error('Error updating book:', err); // Log error for debugging
        res.status(500).send('Error updating book');
    }
});

// DELETE - Remove a book from the database
app.post('/delete/:id', async (req, res) => {
    const user = req.session.user;
    const bookId = req.params.id;

    if (!user) {
        req.flash('error', 'You must be logged in to delete books.');
        return res.redirect('/login');
    }

    // Validate the book ID
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return res.status(400).send('Invalid book ID');
    }

    try {
        const book = await Book.findById(bookId);

        const userProfile = await UserProfile.findById(user._id).populate('books');
        if (!book || !userProfile.books.some(b => b._id.toString() === book._id.toString())) {
            return res.status(403).send('You do not have permission to delete this book.');
        }

        await Book.findByIdAndDelete(bookId);
        res.redirect('/');
    } catch (err) {
        console.error('Error deleting book:', err); // Log error for debugging
        res.status(500).send('Error deleting book');
    }
});

// Route to view the profile
app.get('/profile', async (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash('error', 'You must be logged in to view your profile.');
        return res.redirect('/login');
    }

    try {
        const userProfile = await UserProfile.findById(user._id).populate('books');
        res.render('profile', { userProfile, bookCount: userProfile.books.length });
    } catch (err) {
        console.error('Error retrieving profile:', err); // Log error for debugging
        res.status(500).send('Error retrieving profile');
    }
});

// Route to display the create profile page
app.get('/create-profile', (req, res) => {
    res.render('create-profile.ejs');
});

// Route to create a user profile
app.post('/create-profile', async (req, res) => {
    const { username, password } = req.body;

    try {
        const newUserProfile = new UserProfile({ username, password });
        await newUserProfile.save();
        res.redirect('/login');
    } catch (err) {
        console.error('Error saving profile:', err); // Log error for debugging
        res.status(500).send('Error saving profile');
    }
});

// Login Route
app.get('/login', (req, res) => {
    res.render('login.ejs');
});

// POST /login - Handle login form submissions
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const userProfile = await UserProfile.findOne({ username }).populate('books');

        if (userProfile && userProfile.password === password) {
            req.session.user = userProfile;
            res.redirect('/profile');
        } else {
            req.flash('error', 'Invalid username or password.');
            res.redirect('/login');
        }
    } catch (err) {
        console.error('Error logging in:', err); // Log error for debugging
        res.status(500).send('Error logging in');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});