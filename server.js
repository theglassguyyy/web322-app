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

const express = require("express");
const path = require("path");
const storeService = require("./store-service");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const app = express();
const port = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: "dathhpf6m",
    api_key: "787859497635963",
    api_secret: "0DLkivquuJMun_MkEQQap7b0nfs",
    secure: true
});

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/addItem.html'));
});

app.get("/", (req, res) => {
    res.redirect("/about");
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/shop", (req, res) => {
    storeService.getPublishedItems()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.json({ message: err });
        });
});

app.get("/items", (req, res) => {
    const { category, minDate } = req.query;

    if (category) {
        storeService.getItemsByCategory(parseInt(category))
            .then((data) => res.json(data))
            .catch((err) => res.status(404).json({ message: err }));
    } else if (minDate) {
        storeService.getItemsByMinDate(minDate)
            .then((data) => res.json(data))
            .catch((err) => res.status(404).json({ message: err }));
    } else {
        storeService.getAllItems()
            .then((data) => res.json(data))
            .catch((err) => res.status(404).json({ message: err }));
    }
});

app.get("/categories", (req, res) => {
    storeService.getCategories()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.json({ message: err });
        });
});

const upload = multer();

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

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }

        upload(req).then((uploaded) => {
            processItem(uploaded.url);
        }).catch((error) => {
            console.error("Error uploading image:", error);
            res.redirect('/items');
        });
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;
        storeService.addItem(req.body).then((newItem) => {
            res.redirect('/items');
        }).catch((err) => {
            console.error("Error adding item:", err);
            res.redirect('/items');
        });
    }
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

storeService.initialize()
    .then(() => {
        app.listen(port, () => {
            console.log(`Express http server listening on ${port}`);
        });
    })
    .catch((err) => {
        console.error(`Failed to initialize store service: ${err}`);
    });

app.get("/item/:value", (req, res) => {
    const id = req.params.value;
    storeService.getItemById(id)
        .then((item) => {
            res.json(item);
        })
        .catch((err) => {
            res.status(404).json({ message: err });
        });
});