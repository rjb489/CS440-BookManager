// imports
import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';
import session from 'express-session';
import flash from 'express-flash';

// main constants
const app = express();
const port = 8080;

// connect to the database
mongoose.connect('mongodb://localhost:27017/bookLibraryDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// get the schema for books
const bookSchema = new mongoose.Schema
({
    title: String,
    name: String,
    content: String,
    genre: String,
    rating: Number,
    coverImage: String,
    creationTime: String,
});

// get the schema for user profiles
const userProfileSchema = new mongoose.Schema
({
    // get the username, password, and also the book id
    username: String,
    password: String,
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }] 
});

// get the models based on the schemas
const Book = mongoose.model('Book', bookSchema);
const UserProfile = mongoose.model('UserProfile', userProfileSchema);

// set up storage for uploaded files using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

// access the session
app.use(session({
    secret: 'cs440', 
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

// Setting up the ejs and url
app.set('view engine', 'ejs');
app.use('/static', express.static('static'));
app.use('/uploads', express.static('uploads')); 
app.use(bodyParser.urlencoded({ extended: true }));

// get index.ejs 
app.get('/', async (req, res) => 
{
    // make sure user is logged in to view books
    const user = req.session.user;
    if (!user) 
    {
        req.flash('error', 'You must be logged in to view books.');
        return res.redirect('/login');
    }

    try 
    {
        // get the user profile if there is one
        const userProfile = await UserProfile.findById(user._id).populate('books');
        res.render('index.ejs', { bookLibrary: userProfile.books });
    } 
    // if not then give error
    catch (err) 
    {
        res.status(500).send('Error retrieving books');
    }
});

// get reate.ejs
app.get('/create', (req, res) => 
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
app.post('/create-form', upload.single('coverImage'), async (req, res) => 
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
app.get('/view/:id', async (req, res) => 
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
app.get('/edit/:id', async (req, res) => 
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
app.post('/edit-form/:id', upload.single('coverImage'), async (req, res) => 
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
app.post('/delete/:id', async (req, res) => 
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

// get profile.ejs
app.get('/profile', async (req, res) => 
{
    // get the information
    const user = req.session.user;

    // load the users profile with username and book count
    const userProfile = await UserProfile.findById(user._id).populate('books');
    res.render('profile', { userProfile, bookCount: userProfile.books.length });
});

// get create-profile.ejs
app.get('/create-profile', (req, res) => 
{
    res.render('create-profile.ejs');
});

// post create-profile.ejs
app.post('/create-profile', async (req, res) => 
{
    // get the username and password information
    const { username, password } = req.body;

    // update the array and database
    const newUserProfile = new UserProfile({ username, password });
    await newUserProfile.save();
    res.redirect('/login');
});

// get login.ejs
app.get('/login', (req, res) => 
{
    res.render('login.ejs');
});

// post login.ejs
app.post('/login', async (req, res) => 
{
    // get the username and password information
    const { username, password } = req.body;

    // get the users library information
    const userProfile = await UserProfile.findOne({ username }).populate('books');

    // make sure profile is valid
    if (userProfile && userProfile.password === password) 
    {
        // go to profile page
        req.session.user = userProfile;
        res.redirect('/profile');
    } 
    // if not prompt the user to login again
    else 
    {
        req.flash('error', 'Invalid username or password.');
        res.redirect('/login');
    }
});

// start the server
app.listen(port, () => 
{
    console.log(`Server is running on port ${port}.`);
});
