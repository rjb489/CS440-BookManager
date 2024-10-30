// express.js

// Imports
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import mongoose from 'mongoose';
import session from 'express-session';
import flash from 'express-flash';

// Import route files
import bookRoutes from './routes/bookRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = 8080;

// Connect to the database
mongoose.connect('mongodb://localhost:27017/bookLibraryDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Middleware setup
app.use(session({
  secret: 'cs440',
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Setting up the EJS view engine and static files
app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'views'));
app.use('/static', express.static(path.join(path.resolve(), 'public')));
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// Use the routes
app.use('/', bookRoutes);
app.use('/', userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
