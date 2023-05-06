// const { use } = require("express/lib/application");

var express = require("express");
var app = express();
var expressSanitizer = require("express-sanitizer");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var mongoose = require("mongoose");
require("dotenv").config();
var port = process.env.PORT || 3000;
var ipAddress = require("ip").address();
var hostName = require("os").hostname();

// APP config
mongoose.connect(process.env.MONGO_DB_URI);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// Mongoose/Model config
// Blog Schema
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: { type: Date, default: Date.now },
});

// Compiling into a model
var Blog = mongoose.model("Blog", blogSchema);

// RESTful Routes
app.get("/", function (req, res) {
  res.redirect("/blogs");
});

// Index route
app.get("/blogs", function (req, res) {
  Blog.find({}, function (err, blogs) {
    if (err) {
      console.log("Error");
    } else {
      res.render("index", { blogs: blogs });
    }
  });
});

// New route
app.get("/blogs/new", function (req, res) {
  res.render("new");
});

// Create route
app.post("/blogs", function (req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  //Create blog
  Blog.create(req.body.blog, function (err, newBlog) {
    if (err) {
      res.render("new");
    } else {
      res.redirect("/blogs");
    }
  });
});

// Show route
app.get("/blogs/:id", function (req, res) {
  Blog.findById(req.params.id, function (err, foundBlog) {
    if (err) {
      res.redirct("/blogs");
    } else {
      res.render("show", { blog: foundBlog });
    }
  });
});

// Edit route
app.get("/blogs/:id/edit", function (req, res) {
  Blog.findById(req.params.id, function (err, foundBlog) {
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("edit", { blog: foundBlog });
    }
  });
});

// Update route
app.put("/blogs/:id", function (req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(
    req.params.id,
    req.body.blog,
    function (err, updatedBlog) {
      if (err) {
        res.redirect("/blogs");
      } else {
        res.redirect("/blogs/" + req.params.id);
      }
    }
  );
});

// Delete route
app.delete("/blogs/:id", function (req, res) {
  Blog.findByIdAndUpdate(
    req.params.id,
    req.body.blog,
    function (err, updatedBlog) {
      Blog.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
          res.redirect("/blogs");
        } else {
          res.redirect("/blogs");
        }
      });
    }
  );
});

app.listen(port, process.env.IP, function () {
  console.log(
    `Website server started on "${hostName}" at "http://${ipAddress}:${port}"`
  );
});
