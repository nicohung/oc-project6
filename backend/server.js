// Import the http module
const http = require('http');

// Import the app object from the app.js file
const app = require('./app');

// Create a server using the app object
const server = http.createServer(app);

// Listen for incoming requests on port 3000
server.listen(3000, () => {
    // Log a message when the server is ready
    console.log('Server is running on http://localhost:3000');
});