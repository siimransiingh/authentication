//jshint esversion:6
const dotenv = require('dotenv').config({
    path: __dirname + '/.env'
  });
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const port = 3000;
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const saltRounds = 10;
const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/userDB")

const userSchema = new mongoose.Schema( {
    email: String,
    password: String
});


const User = new mongoose.model("User", userSchema);

app.get("/", function(req,res){
    res.render("home");
})
app.route("/login")
.get(function(req,res){
    res.render("login");
})
.post(async function(req,res){
    try{
    const username = req.body.username;
    const password = req.body.password;
    
    
        const foundName = await User.findOne({email: username})
        const check = await bcrypt.compare(password, foundName.password);
        if(check === false) throw new error();
            res.render("secrets");
    }catch(err){
        console.log("passsword is incoorent" + error);
    }
})

app.route("/register")
.get(function(req,res){
    res.render("register");
})

.post(async function(req,res){
    try{
        const hash = await bcrypt.hash(req.body.password, saltRounds);
        const newUser = new User({
            email: req.body.username,
            password:hash
        });
        await newUser.save()
        console.log("added user to DB")
            res.render("secrets")
    }catch(err){
        console.log(err)
    }
})


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});