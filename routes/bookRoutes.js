// routes/bookRoutes.js

const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// Route to display all books
router.get('/', bookController.getAllBooks);

// Route to display a single book's details
router.get('/:id', bookController.getBookById);

// Route to display the form for creating a new book
router.get('/create', bookController.showCreateForm);

// Route to handle the submission of the new book form
router.post('/create', bookController.createBook);

// Route to display the form for editing a book
router.get('/:id/edit', bookController.showEditForm);

// Route to handle the submission of the edit book form
router.post('/:id/edit', bookController.updateBook);

// Route to handle the deletion of a book
router.post('/:id/delete', bookController.deleteBook);

module.exports = router;

// Chat Explanation
/* 
Explanation:

Imports:
   express: The Express framework.
   router: An instance of express.Router() to define route handlers.
   bookController: The controller that contains methods to handle requests.
Routes:
   router.get('/'):
      Path: /books/
      Action: Retrieves and displays a list of all books.
      Controller Method: bookController.getAllBooks
   router.get('/:id'):
      Path: /books/:id (e.g., /books/123)
      Action: Displays details of a specific book.
      Controller Method: bookController.getBookById
   router.get('/create'):
      Path: /books/create
      Action: Displays the form to create a new book.
      Controller Method: bookController.showCreateForm
   router.post('/create'):
      Path: /books/create
      Action: Handles form submission to create a new book.
      Controller Method: bookController.createBook
   router.get('/:id/edit'):
      Path: /books/:id/edit
      Action: Displays the form to edit an existing book.
      Controller Method: bookController.showEditForm
   router.post('/:id/edit'):
      Path: /books/:id/edit
      Action: Handles form submission to update a book.
      Controller Method: bookController.updateBook
   router.post('/:id/delete'):
      Path: /books/:id/delete
      Action: Handles the deletion of a book.
      Controller Method: bookController.deleteBook
Exporting the Router:

module.exports = router;: Makes the router available for import in your main application file.
*/