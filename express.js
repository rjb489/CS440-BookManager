// imports
import express from 'express';
import bodyParser from 'body-parser';
import bookRoutes from './routes.js';

// main constants
const app = express();
const port = 8080;

// get the api integration
app.use(bodyParser.json());
app.use('/api', bookRoutes); 

// connect to the correct port
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
