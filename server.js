// server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the "public" folder
app.use(express.static('public'));

// Redirect the root ("/") to "/about"
app.get('/', (req, res) => {
  res.redirect('/about');
});

// Serve the "/about" page
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Express http server listening on port ${PORT}`);
});
