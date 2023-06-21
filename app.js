//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const port = 3000;
const encrypt = require("mongoose-encryption");
const mongoose = require("mongoose");

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/userDB")

const userSchema = {
    email: String,
    password: String
};

const User = new mongoose.model("User", userSchema);

app.get("/", function(req,res){
    res.render("home");
})
app.route("/login")
.get(function(req,res){
    res.render("login");
})
.post(async function(req,res){
    const username = req.body.username;
    const password = req.body.password;
    
    try{
        const foundName = await User.findOne({email: username})
        if(foundName){
            if(foundName.password === password) {
                res.render("secrets");
            }else{
                console.log("password does not match")
            }
        }
    }catch(err){
        console.log(err);
    }
})

app.route("/register")
.get(function(req,res){
    res.render("register");
})
.post(async function(req,res){
    try{
        const newUser = new User({
            email: req.body.username,
            password:req.body.password
        });
        const result = await newUser.save()
        if(result) {
            res.render("secrets")
        }else{
            console.log("login failed");
        }
    }catch(err){
        console.log(err)
    }
})


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});