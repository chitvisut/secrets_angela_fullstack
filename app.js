//jshint esversion:6
const dotenv = require("dotenv"); //require("dotenv").config() -> .env
dotenv.config({path: './config/config.env'})

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");


mongoose.connect(process.env.MONGO_URI, function(err, result) {
    if (err) {
        console.log(err)
    } else {
        console.log("successfully connected to MongoDB Atlas:" + result.host)
    }
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields:["password"]}) // add plugin before creating a model

const User = new mongoose.model("User", userSchema);

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.get("/", function(req,res) {
    res.render("home")
});

app.get("/login", function(req,res) {
    res.render("login")
});

app.get("/register", function(req,res) {
    res.render("register")
});

app.post("/register", function(req,res) {
    //console.log(req.body)
    const newUser = User.create({
        email: req.body.username,
        password: req.body.password
    }, function(err, result){
        if (err) {
            console.log(err);
        } else {
            //console.log(result);
            res.render("secrets");
        }
    })
})

app.post("/login", function(req,res) {
    const email = req.body.username
    const password = req.body.password
    User.findOne({email: email}, function(err,result) {
        if (err) {
            console.log(err)
        } else {
            if (result) {
                if (result.password === password) {
                    console.log(email + " has successfully login")
                    res.render("secrets")
                } else {
                    console.log(email + " has failed to login")
                    res.render("login")
                }
            } else {
                console.log(email + " is not found")
                res.render("login")
            }
        }
    })
})

const PORT = process.env.PORT || 3000

const server = app.listen(3000, function(err) {
    if (err) {
        console.log(err)
    } else {
        console.log("Server started on port 3000")
    }
})

process.on("unhandledRejection", function(err,promise) {
    console.log(`Error: ${err, promise}`);
    server.close(function(){
        process.exit(1)
    });
});