// Import the express module
const express = require('express');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

// Create an express application
const app = express();

mongoose.connect('mongodb+srv://username:/?retryWrites=true&w=majority')
    .then(() => {
        console.log('sucessfully connected to mongodb atlas');
    })
    .catch((error) => {
        console.log('unable to connect to mongodb atlas');
        //output the error to the console
        console.error(error);
    })

//allow the application to serve general static files from both the public and uploads folder
// app.use(express.static('public/uploads'));
app.use('/public/uploads', express.static('public/uploads'));

app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
 

//interecepts any requests that has a json content type, takes the body, and put it in the request object as the body property for us. 
//easy access to the request body. 
app.use(express.json());

//to avoid CORS error so our localhost 4200 and 3000 talk to each other
//applied to all incoming requests
//respond by setting various headers, allowing any requests from any origin to be allowed
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});



app.use('/api/auth', userRoutes);

app.use('/api/sauces', sauceRoutes);


// Export the app object to the server.js file
module.exports = app;