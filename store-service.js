<<<<<<< HEAD
const Sequelize = require('sequelize');
var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'VpmRDZQvo3r8', {
    host: 'ep-cool-mode-a5m9gqmz.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Models
const Item = sequelize.define('Item', {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
  price: Sequelize.DOUBLE
});

const Category = sequelize.define('Category', {
  category: Sequelize.STRING
});

// Define relationships
Item.belongsTo(Category, { foreignKey: 'category' });

// Function to initialize the database and sync models
const initialize = () => {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then(() => resolve("Database and models synced successfully"))
      .catch(err => reject("Unable to sync the database: " + err));
  });
};

// Function to get all items
const getAllItems = () => {
  return new Promise((resolve, reject) => {
    Item.findAll()
      .then(data => resolve(data))
      .catch(err => reject("No results returned: " + err));
  });
};

// Function to get published items
const getPublishedItems = () => {
  return new Promise((resolve, reject) => {
    Item.findAll({ where: { published: true } })
      .then(data => resolve(data))
      .catch(err => reject("No results returned: " + err));
  });
};

// Function to get published items by category
const getPublishedItemsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    Item.findAll({ where: { published: true, category } })
      .then(data => resolve(data))
      .catch(err => reject("No results returned: " + err));
  });
};

// Function to get all categories
const getCategories = () => {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then(data => resolve(data))
      .catch(err => reject("No results returned: " + err));
  });
};

// Function to add an item
const addItem = (itemData) => {
  return new Promise((resolve, reject) => {
    itemData.published = itemData.published !== undefined ? true : false;
    for (let key in itemData) {
      if (itemData[key] === "") itemData[key] = null;
    }
    itemData.postDate = new Date();

    Item.create(itemData)
      .then(data => resolve(data))
      .catch(err => reject("Unable to create item: " + err));
  });
};

// Function to get items by category
const getItemsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    Item.findAll({ where: { category } })
      .then(data => resolve(data))
      .catch(err => reject("No results returned: " + err));
  });
};

// Function to get items by minimum date
const getItemsByMinDate = (minDateStr) => {
  return new Promise((resolve, reject) => {
    const { gte } = Sequelize.Op;
    Item.findAll({ where: { postDate: { [gte]: new Date(minDateStr) } } })
      .then(data => resolve(data))
      .catch(err => reject("No results returned: " + err));
  });
};

// Function to get item by ID
const getItemById = (id) => {
  return new Promise((resolve, reject) => {
    Item.findByPk(id)
      .then(data => {
        if (data) resolve(data);
        else reject("No results returned");
      })
      .catch(err => reject("No results returned: " + err));
  });
};

// Function to add a new category
const addCategory = (categoryData) => {
  return new Promise((resolve, reject) => {
    // Replace empty string values with null
    for (let key in categoryData) {
      if (categoryData[key] === "") categoryData[key] = null;
    }

    // Create the category
    Category.create(categoryData)
      .then(() => resolve("Category added successfully"))
      .catch(err => reject("Unable to create category: " + err));
  });
};

// Function to delete a category by ID
const deleteCategoryById = (id) => {
  return new Promise((resolve, reject) => {
    // Destroy the category with the given ID
    Category.destroy({ where: { id } })
      .then((rowDeleted) => {
        if (rowDeleted === 0) {
          reject("Category not found");
        } else {
          resolve("Category deleted successfully");
        }
      })
      .catch(err => reject("Unable to remove category: " + err));
  });
};

// Function to delete a post by ID
const deletePostById = (id) => {
  return new Promise((resolve, reject) => {
    // Destroy the post with the given ID
    Item.destroy({ where: { id } })
      .then((rowDeleted) => {
        if (rowDeleted === 0) {
          reject("Post not found");
        } else {
          resolve("Post deleted successfully");
        }
      })
      .catch(err => reject("Unable to remove post: " + err));
  });
};

const addcategories = (categoryData) => {
  return new Promise((resolve, reject) => {
      // Replace empty strings with null
      for (let key in categoryData) {
          if (categoryData[key] === "") categoryData[key] = null;
      }

      // Create the category in the database
      Category.create(categoryData)
          .then(() => resolve("Category added successfully"))
          .catch((err) => reject("Unable to create category: " + err));
  });
};

function addCategory(categoryData) {
  return Category.create(categoryData);
}

function deleteCategoryById(id) {
  return Category.destroy({ where: { id } });
}

function deletePostById(id) {
  return Post.destroy({ where: { id } });
}
function deletePostById(id) {
  return Post.destroy({ where: { id } });
}


=======
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
>>>>>>> 787a06290201e69b8ff7e67e77fc230ee5ff63ba
module.exports = {
  initialize,
  getAllItems,
  getPublishedItems,
<<<<<<< HEAD
  getCategories,
  addItem,
  getItemsByCategory,
  getItemsByMinDate,
  getItemById,
  getPublishedItemsByCategory,
  addCategory,
  deleteCategoryById,
  deletePostById,
=======
  getCategories
>>>>>>> 787a06290201e69b8ff7e67e77fc230ee5ff63ba
};
