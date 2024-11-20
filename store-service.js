const fs = require("fs").promises;
const path = require("path");

let items = [];
let categories = [];

// Initialize the service by loading JSON files
function initialize() {
    return Promise.all([
        fs.readFile(path.join(__dirname, "data", "items.json"), "utf8")
            .then((data) => {
                items = JSON.parse(data);
            }),
        fs.readFile(path.join(__dirname, "data", "categories.json"), "utf8")
            .then((data) => {
                categories = JSON.parse(data);
            }),
    ])
        .then(() => {
            if (!items.length || !categories.length) {
                throw new Error("Data is empty");
            }
        })
        .catch((err) => {
            throw new Error(`Unable to read file: ${err.message}`);
        });
}

// Get all items
function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length > 0) {
            resolve(items);
        } else {
            reject("No results returned");
        }
    });
}

// Get all published items
function getPublishedItems() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter((item) => item.published === true);
        if (publishedItems.length > 0) {
            resolve(publishedItems);
        } else {
            reject("No results returned");
        }
    });
}

// Get all categories
function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        } else {
            reject("No results returned");
        }
    });
}

// Get published items by category
function getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(
            (item) => item.published === true && item.category === parseInt(category)
        );
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("No results returned");
        }
    });
}

// Get items by category
function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter((item) => item.category === parseInt(category));
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("No results returned");
        }
    });
}

// Get items by minimum date
function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(
            (item) => new Date(item.postDate) >= new Date(minDateStr)
        );
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("No results returned");
        }
    });
}

// Get item by ID
function getItemById(id) {
    return new Promise((resolve, reject) => {
        const item = items.find((item) => item.id === parseInt(id));
        if (item) {
            resolve(item);
        } else {
            reject("No result returned");
        }
    });
}

// Add a new item
function addItem(itemData) {
    return new Promise((resolve, reject) => {
        if (!itemData) {
            reject("No data provided");
        } else {
            // Add current date as postDate
            itemData.postDate = new Date().toISOString().split("T")[0];

            // Push new item to items array
            items.push(itemData);

            // Persist to items.json
            fs.writeFile(
                path.join(__dirname, "data", "items.json"),
                JSON.stringify(items, null, 2)
            )
                .then(() => resolve())
                .catch((err) => reject(`Failed to add item: ${err.message}`));
        }
    });
}

// Export all functions
module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    getPublishedItemsByCategory,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
    addItem,
};
