// server.js
const express = require('express');
const path = require('path');
const storeService = require('./store-service'); // Import the store-service.js module

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

// "/shop" route - return all published items
app.get('/shop', (req, res) => {
  storeService.getPublishedItems()
    .then(data => {
      res.json(data); // Send the published items as a JSON response
    })
    .catch(err => {
      res.status(500).json({ message: err }); // Send an error message if the operation fails
    });
});

// "/items" route - return all items
app.get('/items', (req, res) => {
  storeService.getAllItems()
    .then(data => {
      res.json(data); // Send all items as a JSON response
    })
    .catch(err => {
      res.status(500).json({ message: err }); // Send an error message if the operation fails
    });
});

// "/categories" route - return all categories
app.get('/categories', (req, res) => {
  storeService.getCategories()
    .then(data => {
      res.json(data); // Send all categories as a JSON response
    })
    .catch(err => {
      res.status(500).json({ message: err }); // Send an error message if the operation fails
    });
});

// Handle unmatched routes - custom 404 response
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// Start the server only if initialize() is successful
storeService.initialize()
  .then(() => {
    // Only call app.listen() if initialization is successful
    app.listen(PORT, () => {
      console.log(`Express http server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    // If initialization fails, log the error and do not start the server
    console.error(`Failed to initialize data: ${err}`);
  });
