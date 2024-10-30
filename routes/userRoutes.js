import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const router = express.Router();

// Define the UserProfile schema and model
const userProfileSchema = new mongoose.Schema({
  username: String,
  password: String,
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

// Export UserProfile so it can be imported in bookRoutes.js
export { UserProfile };

// Controller functions

// Show login form
router.get('/login', (req, res) => {
  res.render('login.ejs');
});

// Handle user login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const userProfile = await UserProfile.findOne({ username }).populate('books');

    if (userProfile) {
      const match = await bcrypt.compare(password, userProfile.password);
      if (match) {
        req.session.user = userProfile;
        return res.redirect('/profile');
      }
    }

    req.flash('error', 'Invalid username or password.');
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred during login.');
    res.redirect('/login');
  }
});

// Handle user logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Show registration form
router.get('/register', (req, res) => {
  res.render('create-profile.ejs');
});

// Handle user registration
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserProfile = new UserProfile({ username, password: hashedPassword });
    await newUserProfile.save();
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred during registration.');
    res.redirect('/register');
  }
});

// Display user profile
router.get('/profile', async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      req.flash('error', 'You must be logged in to view your profile.');
      return res.redirect('/login');
    }

    const userProfile = await UserProfile.findById(user._id).populate('books');
    res.render('profile.ejs', { userProfile, bookCount: userProfile.books.length });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

export default router;
