// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to display the login form
router.get('/login', userController.showLoginForm);

// Route to handle login form submission
router.post('/login', userController.login);

// Route to handle user logout
router.get('/logout', userController.logout);

// Route to display the registration form
router.get('/register', userController.showRegisterForm);

// Route to handle registration form submission
router.post('/register', userController.register);

// Route to display the user's profile
router.get('/profile', userController.getUserProfile);

module.exports = router;