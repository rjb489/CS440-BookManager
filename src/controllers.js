// get all books
export const getAllBooks = async (req, res, Book) => 
{
	// get all the books from the database
    await Book.find();
};

// get a book by its id
export const getBookById = async (req, res, Book) => 
{
	// get the book id from parameters and find in database
    const bookId = req.params.id;
    await Book.findById(bookId);
};

// create a new book
export const createBook = async (req, res, Book) => 
{
	// get the book information from parameters
    const { title, name, content, genre, rating, 
    			coverImage, creationTime } = req.body;

    // create the new book
    const newBook = new Book({ title, name, content, 
    			genre, rating, coverImage, creationTime });

    // save to database
    await newBook.save();
};

// update the book by id
export const updateBook = async (req, res, Book) => 
{
	// get id from params and deconstruct
    const bookId = req.params.id;
    const updateData = req.body;

    // update it to database
    await Book.findByIdAndUpdate(bookId, updateData, { new: true });
};

// delete a book
export const deleteBook = async (req, res, Book) => 
{
	// get book id and delete it in database
    const bookId = req.params.id;
    await Book.findByIdAndDelete(bookId);
};

// get all users
export const getAllUsers = async (req, res, UserProfile) => 
{
	// find all usesrs in the database
	await UserProfile.find().populate('books');
};

// get user by id
export const getUserById = async (req, res, UserProfile) => 
{
	// grab the id and update the database
    const userId = req.params.id;
    await UserProfile.findById(userId).populate('books');
};

// create the user itself
export const createUser = async (req, res, UserProfile) => 
{

	// get data from user
    const { username, password, books } = req.body;

    // create the new user and update that to database
    const newUser = new UserProfile({ username, password, books });
    await newUser.save();
};

// update user infromation
export const updateUser = async (req, res, UserProfile) => 
{
	// get userid from params
    const userId = req.params.id;

    // update the users information and save that to database
    const updateData = req.body;
    await UserProfile.findByIdAndUpdate(userId, 
    		updateData, { new: true }).populate('books');
};

// delete user
export const deleteUser = async (req, res, UserProfile) => 
{
	// get userid from params and delete it from database
    const userId = req.params.id;
	await UserProfile.findByIdAndDelete(userId);
};

