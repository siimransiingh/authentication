// Import required packages
const dotenv = require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const port = 3000;
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

// Set up static files and view engine
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// Set up session middleware
app.use(session({
    secret: "our little secret.",
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport and use session middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/userDB");

// Define user schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// Use passport-local-mongoose plugin for user schema
userSchema.plugin(passportLocalMongoose);

// Create User model
const User = new mongoose.model("User", userSchema);

// Set up passport strategies for serialization and deserialization

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
// Serialize the user object and store it in the session

passport.deserializeUser(User.deserializeUser());
// Deserialize the user object from the session and attach it to the request object as req.user

// Home route
app.get("/", function(req, res) {
    res.render("home");
});

// Login route
app.route("/login")
    .get(function(req, res) {
        res.render("login");
    })
    .post((req, res) => {
        const newUser = new User({
            username: req.body.username,
            password: req.body.password
        });
        try {
            req.login(newUser, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    passport.authenticate("local")(req, res, function() {
                        res.redirect("/secrets");
                    });
                }
            });
        } catch (err) {
            console.log(err);
        }
    });

// Secrets route
app.get('/secrets', (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect('/login');
    }
});

// Submit route
app.get("/submit", (req, res) => {
    res.render("submit");
});

// Logout route
app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

// Register route
app.route("/register")
    .get(function(req, res) {
        res.render("register");
    })
    .post(async function(req, res) {
        const username = req.body.username;
        const password = req.body.password;
        User.register({ username: username }, password).then(() => {
            const authenticate = passport.authenticate("local");
            authenticate(req, res, () => {
                res.redirect('/secrets');
            });
        }).catch(err => {
            console.log(err);
            res.redirect("/register");
        });
    });

// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
