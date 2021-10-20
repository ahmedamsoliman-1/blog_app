const { use } = require("express/lib/application");

var     express = require("express"),
        app = express(),
        expressSanitizer = require("express-sanitizer"),
        bodyParser = require("body-parser"),
        methodOverride = require("method-override"),
        mongoose = require("mongoose");

// APP config
mongoose.connect("mongodb://localhost/resetful_blog_app_updated");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// Mongoose/Model config 
// Blog Schema
var blogSchema = new mongoose.Schema(
    {
        title: String,
        image: String,
        body: String,
        created: {type: Date, default: Date.now}
    }
);

// Compiling into a model
var Blog = mongoose.model("Blog", blogSchema);
 

// Blog.create(
//     {
//         title: "Lorem Ipsum 2",
//         image: "https://images.unsplash.com/photo-1487730116645-74489c95b41b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Y2FtcGdyb3VuZHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
//         body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
//     }
// );

// RESTful Routes
app.get("/", function(req, res)
{
    res.redirect("/blogs");
});


// Index route
app.get("/blogs", function(req, res)
{
    Blog.find({}, function(err, blogs)
    {
        if(err)
        {
            console.log("Error"); 
        }
        else
        {
            res.render("index", {blogs: blogs});
        }
    });
});

// New route
app.get("/blogs/new", function(req, res)
{
    res.render("new");
});

// Create route
app.post("/blogs", function(req, res)
{
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //Create blog
    Blog.create(req.body.blog, function(err, newBlog)
    {
        if(err)
        {
            res.render("new");
        }
        else
        {
            res.redirect("/blogs");
        }
    });
});

// Show route
app.get("/blogs/:id", function(req, res)
{
    Blog.findById(req.params.id, function(err, foundBlog)
    {
        if(err)
        {
            res.redirct("/blogs");
        }
        else
        {
            res.render("show", {blog: foundBlog});
        }
    });
});

// Edit route
app.get("/blogs/:id/edit", function(req, res)
{
    
    Blog.findById(req.params.id, function(err, foundBlog)
    {
        if(err)
        {
            res.redirect("/blogs")
        }
        else
        {
            res.render("edit", {blog: foundBlog});
        }
    });
    
});

// Update route
app.put("/blogs/:id", function(req, res)
{
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog)
    {
        if(err)
        {
            res.redirect("/blogs");
        }
        else
        {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// Delete route
app.delete("/blogs/:id", function(req, res)
{
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog)
    {
        Blog.findByIdAndRemove(req.params.id, function(err)
        {
            if(err)
            {
                res.redirect("/blogs");
            }
            else
            {
                res.redirect("/blogs");
            }
        });
    });
});

app.listen(3000, process.env.IP, function()
{
    console.log("Blog server started ...");
});
 