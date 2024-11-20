/********************************************************************************* 

WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
of this assignment has been copied manually or electronically from any other source (including 3rd
party web sites) or distributed to other students.

Name: Aashish Sapkota 
Student ID: 147442222 
Date: 2024-11-20

Cyclic Web App URL: https://lapis-inquisitive-radius.glitch.me/about
GitHub Repository URL: https://github.com/theglassguyyy/web322-app

********************************************************************************/ 

const express = require("express");
const path = require("path");
const storeService = require("./store-service");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const exphbs = require("express-handlebars");

const app = express();
const port = process.env.PORT || 8080;

// Configure Handlebars as the view engine
app.engine(
    ".hbs",
    exphbs.engine({
        extname: ".hbs",
        defaultLayout: "main",
        layoutsDir: path.join(__dirname, "views/layouts"),
        helpers: {
            navLink: function (url, options) {
                return `<li class="nav-item ${app.locals.activeRoute === url ? "active" : ""}">
                            <a class="nav-link" href="${url}">${options.fn(this)}</a>
                        </li>`;
            },
            equal: function (lvalue, rvalue, options) {
                return lvalue != rvalue ? options.inverse(this) : options.fn(this);
            },
            safeHTML: function (context) {
                return new Handlebars.SafeString(context);
            },
        },
    })
);

app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));

// Cloudinary configuration
cloudinary.config({
    cloud_name: "dathhpf6m",
    api_key: "787859497635963",
    api_secret: "0DLkivquuJMun_MkEQQap7b0nfs",
    secure: true,
});

// Middleware
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to set active route and category
app.use((req, res, next) => {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// Route to the addItem page
app.get("/items/add", (req, res) => {
    res.render("addItem", { title: "Add Item - theglassguyyy" });
});

// Redirect to shop page
app.get("/", (req, res) => {
    res.redirect("/shop");
});

// About page
app.get("/about", (req, res) => {
    res.render("about");
});

// `/shop` Route
app.get("/shop", async (req, res) => {
    let viewData = {};

    try {
        let posts = req.query.category
            ? await storeService.getPublishedItemsByCategory(req.query.category)
            : await storeService.getPublishedItems();

        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        viewData.posts = posts;
        viewData.post = posts[0]; // The most recent item
    } catch (err) {
        viewData.message = "No results found";
    }

    try {
        const categories = await storeService.getCategories();
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "Failed to fetch categories";
    }

    res.render("shop", { data: viewData });
});

// `/shop/:id` Route
app.get("/shop/:id", async (req, res) => {
    let viewData = {};

    try {
        const post = await storeService.getItemById(req.params.id);
        viewData.post = post || null;
    } catch (err) {
        viewData.message = "Item not found";
    }

    try {
        const categories = await storeService.getCategories();
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "Failed to fetch categories";
    }

    try {
        const posts = await storeService.getPublishedItems();
        viewData.posts = posts;
    } catch (err) {
        viewData.message = "No results found";
    }

    res.render("shop", { data: viewData });
});

// `/items` Route
app.get("/items", async (req, res) => {
    const { category, minDate } = req.query;

    try {
        let items;
        if (category) {
            items = await storeService.getItemsByCategory(parseInt(category));
        } else if (minDate) {
            items = await storeService.getItemsByMinDate(minDate);
        } else {
            items = await storeService.getAllItems();
        }

        res.render("items", { items: items.length ? items : null, message: items.length ? null : "No items found" });
    } catch (err) {
        res.render("items", { message: "An error occurred while fetching items" });
    }
});

// Categories route
app.get("/categories", async (req, res) => {
    try {
        const categories = await storeService.getCategories();
        res.render("categories", { categories });
    } catch (err) {
        res.render("categories", { message: "No categories found" });
    }
});

// Multer setup for image uploads
const upload = multer();

// POST route to add a new item
app.post("/items/add", upload.single("featureImage"), (req, res) => {
    const uploadImage = async () => {
        const streamUpload = (req) => new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream((error, result) => {
                if (result) resolve(result);
                else reject(error);
            });
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        return await streamUpload(req);
    };

    if (req.file) {
        uploadImage(req)
            .then((uploaded) => processItem(uploaded.url))
            .catch(() => res.redirect("/items"));
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;
        storeService.addItem(req.body)
            .then(() => res.redirect("/items"))
            .catch(() => res.redirect("/items"));
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

// Initialize store service and start server
storeService
    .initialize()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    })
    .catch((err) => console.error(`Failed to start server: ${err}`));
