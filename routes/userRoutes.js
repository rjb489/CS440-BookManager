// imports
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// constants
const router = express.Router();
const userProfileSchema = new mongoose.Schema(
{
  username: String,
  password: String,
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
});
const UserProfile = mongoose.model('UserProfile', userProfileSchema);

// export UserProfile so it can be imported in bookRoutes.js
export { UserProfile };

// get profile.ejs
router.get('/profile', async (req, res) => 
{
    // get the information
    const user = req.session.user;

    // load the users profile with username and book count
    const userProfile = await UserProfile.findById(user._id).populate('books');
    res.render('profile', { userProfile, bookCount: userProfile.books.length });
});

// get create-profile.ejs
router.get('/create-profile', (req, res) => 
{
    res.render('create-profile.ejs');
});

// post create-profile.ejs
router.post('/create-profile', async (req, res) => 
{
    // get the username and password information
    const { username, password } = req.body;

    // update the array and database
    const newUserProfile = new UserProfile({ username, password });
    await newUserProfile.save();
    res.redirect('/login');
});

// get login.ejs
router.get('/login', (req, res) => 
{
    res.render('login.ejs');
});

// post login.ejs
router.post('/login', async (req, res) => 
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

export default router;
