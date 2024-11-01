/********************************************************************************* 
WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
of this assignment has been copied manually or electronically from any other source 
(including 3rd party web sites) or distributed to other students.
Name: Aashish Sapkota 
Student ID: 147442222 
Date: 2024-10-26
Cyclic Web App URL: https://lapis-inquisitive-radius.glitch.me/about
GitHub Repository URL: https://github.com/theglassguyyy/web322-app
********************************************************************************/

const fs = require('fs').promises;
const path = require('path');

let items = [];
let categories = [];

function initialize() {
    return Promise.all([
        fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8')
            .then(data => {
                items = JSON.parse(data);
            }),
        fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8')
            .then(data => {
                categories = JSON.parse(data);
            })
    ])
    .then(() => {
        if (items.length === 0 || categories.length === 0) {
            throw new Error("Data is empty");
        }
    })
    .catch(err => {
        throw new Error(`Unable to read file: ${err.message}`);
    });
}

function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length > 0) {
            resolve(items);
        } else {
            reject("No results returned");
        }
    });
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length > 0) {
            resolve(publishedItems);
        } else {
            reject("No results returned");
        }
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        } else {
            reject("No results returned");
        }
    });
}

function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category === parseInt(category));
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("No results returned");
        }
    });
}

function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("No results returned");
        }
    });
}

function getItemById(id) {
    return new Promise((resolve, reject) => {
        const item = items.find(item => item.id === parseInt(id));
        if (item) {
            resolve(item);
        } else {
            reject("No result returned");
        }
    });
}

function addItem(itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = itemData.published !== undefined;
        itemData.id = items.length + 1;
        items.push(itemData);
        resolve(itemData);
    });
}


module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
    addItem
};
