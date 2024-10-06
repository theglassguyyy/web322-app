// server.js
const express = require('express');
const path = require('path');
const storeService = require('./store-service');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Route for About page
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Route for Shop 
app.get('/shop', (req, res) => {
  storeService.getPublishedItems()
    .then((data) => res.json(data))
    .catch((err) => res.status(500).json({ message: err }));
});

// Route for Items
app.get('/items', (req, res) => {
  storeService.getAllItems()
    .then((data) => res.json(data))
    .catch((err) => res.status(500).json({ message: err }));
});

// Route for Categories
app.get('/categories', (req, res) => {
  storeService.getCategories()
    .then((data) => res.json(data))
    .catch((err) => res.status(500).json({ message: err }));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Express http server listening on port ${PORT}`);
});
