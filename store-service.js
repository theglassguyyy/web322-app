// store-service.js

// Required Modules
const fs = require('fs');
const path = require('path');

// Global Arrays
let items = [];
let categories = [];

// Function: initialize()
// Reads items.json and categories.json, then assigns the parsed data to the respective arrays
function initialize() {
  return new Promise((resolve, reject) => {
    // Read items.json file
    fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8', (err, data) => {
      if (err) {
        reject('Unable to read file: items.json');
        return;
      }
      items = JSON.parse(data); // Assign the parsed JSON data to the items array

      // Read categories.json file after items.json is successfully read
      fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
        if (err) {
          reject('Unable to read file: categories.json');
          return;
        }
        categories = JSON.parse(data); // Assign the parsed JSON data to the categories array

        // Resolve the promise indicating successful initialization
        resolve();
      });
    });
  });
}

// Function: getAllItems()
// Returns a promise that resolves with all items or rejects with an error message
function getAllItems() {
  return new Promise((resolve, reject) => {
    if (items.length > 0) {
      resolve(items);
    } else {
      reject('No results returned');
    }
  });
}

// Function: getPublishedItems()
// Returns a promise that resolves with items whose published property is true or rejects if none are found
function getPublishedItems() {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter(item => item.published === true);
    if (publishedItems.length > 0) {
      resolve(publishedItems);
    } else {
      reject('No results returned');
    }
  });
}

// Function: getCategories()
// Returns a promise that resolves with all categories or rejects with an error message
function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length > 0) {
      resolve(categories);
    } else {
      reject('No results returned');
    }
  });
}

// Export all the functions to be used in other files like server.js
module.exports = {
  initialize,
  getAllItems,
  getPublishedItems,
  getCategories
};
