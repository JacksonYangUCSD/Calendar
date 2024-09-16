const express = require('express'); // Import the Express library
const path = require('path'); // Import the path module
const app = express(); // Create an instance of the Express app
const PORT = process.env.PORT || 3000; // Define the port (Heroku uses process.env.PORT)

// Serve static files from the "public" directory (where your HTML, CSS, and JS files are)
app.use(express.static(path.join(__dirname, 'public')));

// Define a route to serve your main HTML file (if needed)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Adjust the path as needed
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
