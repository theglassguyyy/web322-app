// Required modules
const Sequelize = require('sequelize');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');

// Database connection
const sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'VpmRDZQvo3r8', {
  host: 'ep-cool-mode-a5m9gqmz.us-east-2.aws.neon.tech',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

// Express app setup
const app = express();
const upload = multer(); // For handling file uploads
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'dmbnbd2du',
  api_key: '597639321322191',
  api_secret: '2xkgMLpGverboy8FDSnrEqxM_hg',
  secure: true,
});

// Handlebars setup
const hbsHelpers = {
  navLink: function (url, options) {
    const className = url === app.locals.activeRoute ? 'nav-link active' : 'nav-link';
    return `<li class="nav-item"><a class="${className}" href="${url}">${options.fn(this)}</a></li>`;
  },
  equal: function (lvalue, rvalue, options) {
    if (arguments.length < 3)
      throw new Error("Handlebars Helper 'equal' needs 2 parameters");
    return lvalue === rvalue ? options.fn(this) : options.inverse(this);
  },
  safeHTML: function (context) {
    return new Handlebars.SafeString(context);
  },
  formatDate: function (dateObj) {
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString();
    let day = dateObj.getDate().toString();
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  },
};

app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  helpers: hbsHelpers,
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Models
const Item = sequelize.define('Item', {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
  price: Sequelize.DOUBLE,
});

const Category = sequelize.define('Category', {
  category: Sequelize.STRING,
});

// Define relationships
Item.belongsTo(Category, { foreignKey: 'category' });

// Initialize database
function initialize() {
  return sequelize.sync()
    .then(() => console.log("Database and models synced successfully"))
    .catch(err => Promise.reject("Unable to sync the database: " + err));
}

// Routes
app.get('/', (req, res) => {
  res.redirect('/shop');
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' });
});

// Shop route
app.get('/shop', async (req, res) => {
  try {
    const categories = await Category.findAll();
    const items = req.query.category
      ? await Item.findAll({ where: { category: req.query.category, published: true } })
      : await Item.findAll({ where: { published: true } });

    res.render('shop', {
      data: {
        categories,
        items,
        item: items.length > 0 ? items[0] : null,
        message: items.length > 0 ? null : 'No results',
      },
    });
  } catch (err) {
    console.error('Error fetching shop data:', err);
    res.render('shop', { data: { message: 'Error fetching data' } });
  }
});

// Items route
app.get('/items', (req, res) => {
  const { category, minDate } = req.query;

  if (category) {
    Item.findAll({ where: { category } })
      .then(items => {
        if (items.length > 0) {
          res.render('items', { items });
        } else {
          res.render('items', { message: 'No results' });
        }
      })
      .catch(() => res.render('items', { message: 'No results found for this category' }));
  } else if (minDate) {
    const { gte } = Sequelize.Op;
    Item.findAll({
      where: {
        postDate: { [gte]: new Date(minDate) },
      },
    })
      .then(items => {
        if (items.length > 0) {
          res.render('items', { items });
        } else {
          res.render('items', { message: 'No results' });
        }
      })
      .catch(() => res.render('items', { message: 'No results found from this date' }));
  } else {
    Item.findAll()
      .then(items => {
        if (items.length > 0) {
          res.render('items', { items });
        } else {
          res.render('items', { message: 'No results' });
        }
      })
      .catch(() => res.render('items', { message: 'No results found' }));
  }
});

// Add Item route
app.get('/items/add', (req, res) => {
  res.render('addItem', { title: 'Add New Item' });
});

// Categories route
app.get('/categories', (req, res) => {
  Category.findAll()
    .then(categories => {
      if (categories.length > 0) {
        res.render('categories', { categories });
      } else {
        res.render('categories', { message: 'No results' });
      }
    })
    .catch(() => res.render('categories', { message: 'Error retrieving categories' }));
});

app.get('/categories/add', (req, res) => {
  res.render('addcategories', { title: 'Add New Category' });
});


// 404 route
app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Page Not Found' });
});

// Start the server after initializing the database
initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error(`Database initialization failed: ${err}`);
  });

