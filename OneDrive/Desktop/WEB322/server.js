/*********************************************************************************

WEB322 – Assignment 05
I declare that this assignment is my own work in accordance with Seneca 
Academic Policy. No part of this assignment has been copied manually 
or electronically from any other source (including 3rd party web sites) or 
distributed to other students. I acknowledge that violation of this policy
to any degree results in a ZERO for this assignment and possible failure of
the course.

Name: Aashish Sapkota
Student ID: 147442222
Date: 2024-12-11
Vercel Web App URL: 
GitHub Repository URL: https://github.com/theglassguyyy/web322-app

********************************************************************************/ 
const authData = require('./auth-service');

// Import the required modules
const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const clientSessions = require('client-sessions');


// Set the cloudinary configuration
cloudinary.config({
    cloud_name: "dathhpf6m",
    api_key: "787859497635963",
    api_secret: "0DLkivquuJMun_MkEQQap7b0nfs",
    secure: true,
});

// Create the instances of the required modules
const app = express();
const upload = multer(); // no { storage: storage } since we are not using disk storage
// Define the port the server should listen on
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));

app.use(clientSessions({
  cookieName: "session", // The cookie name that will store session data
  secret: "@TheGlassGuy31", // Replace with your secret
  duration: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  activeDuration: 1000 * 60 * 5 // Extend session by 5 minutes if active
}));

app.use(function (req, res, next) {
  res.locals.session = req.session; // Pass session to views
  next();
});


function ensureLogin(req, res, next) {
  if (!req.session.user) {
      res.redirect('/login'); // Redirect to the login page if not logged in
  } else {
      next(); // Continue if logged in
  }
}


// Use the body parser middleware to parse the request body
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

app.use(express.urlencoded({ extended: true }));

// Define custom handlebars helper
const hbsHelpers = {
  navLink: function(url, options) 
  {
    const className = url === app.locals.activeRoute ? 'nav-link active' : 'nav-link';
    return `<li class="nav-item"><a class="${className}" href="${url}">${options.fn(this)}</a></li>`;
  },
  equal: function(lvalue, rvalue, options) {
    if (arguments.length < 3)
      throw new Error("Handlebars Helper 'equal' needs 2 parameters");
    return lvalue === rvalue ? options.fn(this) : options.inverse(this);
  },
  safeHTML: function(context) {
    return new Handlebars.SafeString(context);
  },
  // Assignment 5 - Add formatDate helper
  formatDate: function(dateObj) {
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString();
    let day = dateObj.getDate().toString();
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  },
  formatDate: function(dateObj) {
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString();
    let day = dateObj.getDate().toString();
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
};

// Set up Handlebars middleware
app.engine('.hbs', exphbs.engine({
  extname: '.hbs',  // Set handlebars extension to .hbs
  helpers: hbsHelpers, // Register the helpers
}));
app.set('view engine', '.hbs'); // Set the view engine to use handlebars
app.set('views', path.join(__dirname, 'views')); // Set the views directory

// Use the static middleware to serve static files from the "public" directory
app.use(express.static('public'));

// Initialize the store service
const storeData = require('./store-service'); // Import store-service

// Chain both initialize functions before starting the server
storeData.initialize()
  .then(authData.initialize) // Ensure authData initializes after storeData
  .then(() => {
    console.log('All services initialized successfully');
    app.listen(PORT, () => {
      console.log(`Express http server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`Unable to start server: ${err}`);
  });


// GET ROUTES
// Route "/" must redirect the user to the "/about" route
app.get('/', (req, res) => {
  res.redirect('/shop');
});

// Define a route for "/about"
app.get('/about', (req, res) => {
  res.render('about');
});

// Define a route for "/shop", obtained from shop-route.txt from Github
app.get("/shop", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "item" objects
    let items = [];

    // if there's a "category" query, filter the returned items by category
    if (req.query.category) {
      // Obtain the published "item" by category
      items = await storeService.getPublishedItemsByCategory(req.query.category);
    } else {
      // Obtain the published "items"
      items = await storeService.getPublishedItems();
    }

    // sort the published items by itemDate
    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest item from the front of the list (element 0)
    let item = items[0];

    // store the "items" and "item" data in the viewData object (to be passed to the view)
    viewData.items = items;
    viewData.item = item;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await storeService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", { data: viewData });
});


// Define a route for shop/:id
app.get('/shop/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "item" objects
      let items = [];

      // if there's a "category" query, filter the returned items by category
      if(req.query.category){
          // Obtain the published "items" by category
          items = await storeService.getPublishedItemsByCategory(req.query.category);
      }else{
          // Obtain the published "items"
          items = await storeService.getPublishedItems();
      }

      // sort the published items by itemDate
      items.sort((a,b) => new Date(b.itemDate) - new Date(a.itemDate));

      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the item by "id"
      viewData.item = await storeService.getItemById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await storeService.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", {data: viewData})
});


// Updated "/items" route to add error messages when no results are found
app.get('/items', ensureLogin, (req, res) => {
  if (req.query.category) {
    storeService.getItemsByCategory(req.query.category).then((items) => {
      if (items.length > 0) {
        res.render('items', { items: items });
      } else {
        res.render('items', { message: "No results found for this category" });
      }
    }).catch((err) => {
      res.render('items', { message: "No results found for this category" });
    });
  } else if (req.query.minDate) {
    storeService.getItemsByMinDate(req.query.minDate).then((items) => {
      if (items.length > 0) {
        res.render('items', { items: items });
      } else {
        res.render('items', { message: "No results found from this date" });
      }
    }).catch((err) => {
      res.render('items', { message: "No results found from this date" });
    });
  } else {
    storeService.getAllItems().then((items) => {
      if (items.length > 0) {
        res.render('items', { items: items });
      } else {
        res.render('items', { message: "No results found" });
      }
    }).catch((err) => {
      res.render('items', { message: "No results found" });
    });
  }
});

// Define a route for "/categories"
app.get('/categories', ensureLogin, (req, res) => {
  storeService.getCategories()
    .then((categories) => {
      if (categories.length > 0) {
        res.render('categories', { categories: categories });
      } else {
        res.render('categories', { message: "No results found" });
      }
    })
    .catch((err) => {
      res.render('categories', { message: 'Error retrieving categories: ' + err.message });
    });
});

// Route for displaying the add category form
app.get('/categories/add', ensureLogin, (req, res) => {
  res.render('addCategory');
});

// Route for handling the addition of a new category
app.post('/categories/add', (req, res) => {
  storeService.addCategory(req.body)
    .then(() => {
      res.redirect('/categories');
    })
    .catch((err) => {
      res.status(500).send('Unable to add category: ' + err);
    });
});

// Route for deleting a category by id
app.get('/categories/delete/:id', ensureLogin, (req, res) => {
  storeService.deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect('/categories');
    })
    .catch((err) => {
      res.status(500).send('Unable to Remove Category / Category not found: ' + err);
    });
});

// Route for deleting an item by id
app.get('/items/delete/:id', ensureLogin, (req, res) => {
  storeService.deletePostById(req.params.id)
    .then(() => {
      res.redirect('/items');
    })
    .catch((err) => {
      res.status(500).send('Unable to Remove Item / Item not found: ' + err);
    });
});

// Define a route for "/items/add"
app.get('/items/add', ensureLogin, (req, res) => {
  storeService.getCategories()
    .then((data) => {
      res.render('addItem', {categories: data});
    })
    .catch((err) => {
      res.render('addItem', {categories: []});
    });
});

// Define a route for "/items/add"
app.post('/items/add', upload.single('featureImage'), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    // error handling for the upload
    async function upload(req) {
      try {
          let result = await streamUpload(req);
          console.log(result);
          return result;
      } catch (err) {
          throw new Error(`Error uploading image: ${err.message}`);
      }
  }

    upload(req).then((uploaded) => {
      processItem(uploaded.url);
    });
  } else {
    processItem("");
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;
    storeService.addItem(req.body).then((newItem) => {
      res.redirect('/items');
    }).catch((err) => {
      res.status(500).send(err);
    });
  }
});


// Route to get item by id
app.get('/item/value', ensureLogin, (req, res) => {
  storeService.getItemById(req.params.id).then((item) => {
    res.json(item);
  }).catch((err) => {
    res.status(500).send(err);
  });
});

// Route for displaying the add category form
app.get('/categories/add', ensureLogin, (req, res) => {
  res.render('addCategory');
});

// Route for handling the addition of a new category
app.post('/categories/add', (req, res) => {
  storeService.addCategory(req.body)
    .then(() => {
      res.redirect('/categories');
    })
    .catch((err) => {
      res.status(500).send('Unable to add category: ' + err);
    });
});

// Route for deleting a category by id
app.get('/categories/delete/:id', ensureLogin, (req, res) => {
  storeService.deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect('/categories');
    })
    .catch((err) => {
      res.status(500).send('Unable to Remove Category / Category not found: ' + err);
    });
});

// Route for deleting an item by id
app.get('/items/delete/:id', ensureLogin, (req, res) => {
  storeService.deletePostById(req.params.id)
    .then(() => {
      res.redirect('/items');
    })
    .catch((err) => {
      res.status(500).send('Unable to Remove Item / Item not found: ' + err);
    });
});

// Login route
app.get('/login', (req, res) => {
  res.render('login'); // Renders the login page
});

// Register route
app.get('/register', (req, res) => {
  res.render('register'); // Renders the registration page
});

// Handle registration
app.post('/register', (req, res) => {
  authData.registerUser(req.body)
      .then(() => {
          res.render('register', { successMessage: "User created" });
      })
      .catch(err => {
          res.render('register', { errorMessage: err, userName: req.body.userName });
      });
});

// Handle login
app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent'); // Add User-Agent info
  authData.checkUser(req.body)
    .then(user => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
      console.log("Session data after login:", req.session); // Debugging line
      res.redirect('/items'); // Redirect to a restricted route after login
    })
    .catch(err => {
      res.render('login', { errorMessage: err, userName: req.body.userName });
    });
});


// Logout route
app.get('/logout', (req, res) => {
  console.log("Logout route called. Session before reset:", req.session); // Debugging
  req.session.reset(); // Reset the session
  console.log("Session after reset:", req.session); // Debugging
  res.redirect('/'); // Redirect to homepage
});


// User history route
app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory'); // Renders the user's history page
});


// Handle 404 errors
app.use((req, res) => {
  res.status(404).render('404');
});

