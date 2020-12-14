// import dependencies you will use
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");
const fileUpload = require('express-fileupload');
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/hilex", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const session = require("express-session");

// set up the model for admin
const Admin = mongoose.model("Admin", {
  username: String,
  password: String,
});

// set up model for page
const Page = mongoose.model('Page', {
    pageTitle : String,
    pageDetail : String,
    heroImageName : String
});

//set up model for header
const Header = mongoose.model('Header', {
  tagTitle : String,
  logoImageName : String
});

// set up variables to use packages
var myApp = express();
myApp.use(fileUpload());
myApp.use(bodyParser.urlencoded({ extended: false }));

// set up session
myApp.use(
  session({
    secret: "remebermeifyoucan",
    resave: false,
    saveUninitialized: true,
  })
);

// set path to public folders and view folders
myApp.set("views", path.join(__dirname, "views"));
//use public folder for CSS etc.
myApp.use(express.static(__dirname + "/public"));
myApp.set("view engine", "ejs");

// set up different routes (pages) of the website
//home page
myApp.get("/", function (req, res) {
  if(!newHeader) var newHeader;
  Header.findOne({}).exec(function(err, header){
    newHeader = header;
  });
  Page.find({}).exec(function(err, pages){
    res.render('home', {pages: pages, header: newHeader});
  }); // no need to add .ejs to the file name
});

//login page
myApp.get("/login", function (req, res) {
  Header.findOne({}).exec(function(err, header){
    console.log(err);
    newHeader = header;
  });
  Page.find({}).exec(function(err, pages){
    console.log(err);
    res.render('login', {pages:pages, header:newHeader});
    });
});

//edit header
myApp.get('/editheader', function(req, res){
  // check if the user is logged in
  if(req.session.userLoggedIn){
    Header.findOne({}).exec(function(err, header){
      console.log(err);
      res.render('editheader', {header:header});
    });        
  }
  else{ // otherwise send the user to the login page
      res.redirect('/login');
  }
});

myApp.post('/editheader', [
  check('tagTitle').notEmpty() 
],function(req, res){
  var tagTitle = req.body.tagTitle;

  if(!req.files) {
    Header.findOne({}).exec(function(err, header){
      console.log(err);
      newHeader = header;
    });
    res.render('adminTemp', { adminTitle: 'Error', adminMsg: 'You must upload a logo when editing the header!', header: newHeader });
  }
  else{
    var logoName = req.files.logo.name;
    // get the actual image/file uploaded by the user
    var logoImage = req.files.logo;
    // create a path for the image
    var logoImagePath = 'public/user_images/' + logoName;
    // move the file from temp folder to user uploads
    logoImage.mv(logoImagePath, function(err){
        console.log(err);
    });

    // prepare data for output
    var headerData = { 
      tagTitle : tagTitle ,
      logoImageName : logoName
    }

    const errors = validationResult(req);
    if(!errors.isEmpty()){
      console.log(errors.array());
      Header.findOne({}).exec(function(err, header){
        console.log(err);
        newHeader = header;
      });
      res.render('adminTemp', { adminTitle: 'Error', adminMsg: 'You must enter a tagline when editing the header!', header: newHeader });
    }
    else{
      Header.updateOne(headerData).exec();      
      Header.findOne({}).exec(function(err, header){
        console.log(err);
        newHeader = header;
        res.render('adminTemp', { adminTitle: 'Edit Header', adminMsg: 'You have successfully edited the header!', header: newHeader });
      });

    }
  }
});

//addpage
myApp.get("/addpage", function (req, res) {
  // check if the user is logged in
  if(req.session.userLoggedIn){
    Header.findOne({}).exec(function(err, header){
      console.log(err);
      newHeader = header;
    });
    res.render('addpage', { header :newHeader });
  }
  else{ // otherwise send the user to the login page
      res.redirect('/login');
  }
});

myApp.post('/addpage', [
  check('pageTitle').notEmpty(),
  check('pageDetail').notEmpty(),
], function(req, res){
    var pageTitle = req.body.pageTitle;
    var pageDetail = req.body.pageDetail;

    if(!req.files) {
      Header.findOne({}).exec(function(err, header){
        console.log(err);
        newHeader = header;
      });
      res.render('adminTemp', { adminTitle: 'Error', adminMsg: 'You must upload an image when adding a new page!', header: newHeader });
    }
    // fetch the file uploaded
    else{
      // get the name of the image uploaded by the user
      var heroImageName = req.files.heroImage.name;
      // get the actual image/file uploaded by the user
      var heroImage = req.files.heroImage;
      // create a path for the image
      var heroImagePath = 'public/user_images/' + heroImageName;
      // move the file from temp folder to user uploads
      heroImage.mv(heroImagePath, function(err){
          console.log(err);
      });

      // prepare data for output
      var pageData = { 
          pageTitle : pageTitle,
          pageDetail : pageDetail,
          heroImageName : heroImageName
      }

      const errors = validationResult(req);
      if(!errors.isEmpty()){
        console.log(errors.array());
        Header.findOne({}).exec(function(err, header){
          console.log(err);
          newHeader = header;
        });
        res.render('adminTemp', { adminTitle: 'Error', adminMsg: 'Page title or page detail cannot be empty when adding a new page!', header: newHeader });
      }
      else{
        var myPage = new Page(pageData);
        myPage.save();
        Header.findOne({}).exec(function(err, header){
          console.log(err);
          newHeader = header;
        });
        res.render('adminTemp', { adminTitle: 'Add New Page', adminMsg: 'You have successfully added a new page!', header: newHeader });
      }
  }
});

//edit overview page
myApp.get('/editOverview',function(req, res){
  // check if the user is logged in
  if(req.session.userLoggedIn){
    Header.findOne({}).exec(function(err, header){
      console.log(err);
      newHeader = header;
    });
    Page.find({}).exec(function(err, pages){
      console.log(err);
      res.render('editOverview', {pages: pages, header: newHeader});
    });        
  }
  else{ // otherwise send the user to the login page
      res.redirect('/login');
  }
});

//delete page

myApp.get('/delete/:pageid', function(req, res){
  // check if the user is logged in
  if(req.session.userLoggedIn){
      //delete
      var pageid = req.params.pageid;
      console.log(pageid);
      Page.findByIdAndDelete({_id: pageid}).exec(function(err, page){
          console.log('Error: ' + err);
          console.log('Page: ' + page);
          if(page){
            Header.findOne({}).exec(function(err, header){
              newHeader = header;
            });
              res.render('adminTemp', {adminTitle: 'Delete', adminMsg: 'You have successfully deleted the page!', header: newHeader});
          }
          else{
            Header.findOne({}).exec(function(err, header){
              newHeader = header;
            });
            res.render('adminTemp', {adminTitle: 'Error', adminMsg: 'Sorry, page cannot be deleted!', header: newHeader});
          }
      });
  }
  else{
      res.redirect('/login');
  }
});

//edit page
myApp.get('/edit/:pageid', function(req, res){
  // check if the user is logged in
  if(req.session.userLoggedIn){
      var pageid = req.params.pageid;
      console.log(pageid);
      Header.findOne({}).exec(function(err, header){
        newHeader = header;
      });    
      Page.findOne({_id: pageid}).exec(function(err, page){
          console.log('Error: ' + err);
          console.log('Page: ' + page);
          if(page){
              res.render('editpage', {page: page, header: newHeader});
          }
          else{
              res.send('No page found with that id...');
          }
      });
  }
  else{
      res.redirect('/login');
  }
});


myApp.post('/edit/:id', [
  check('pageTitle', 'Page title cannot be empty.').notEmpty(),
  check('pageDetail', 'Page Detail cannot be empty.').notEmpty(),  
],function(req, res){

  const errors = validationResult(req);
  if (!errors.isEmpty()){
      var pageid = req.params.id;
      Header.findOne({}).exec(function(err, header){
        newHeader = header;
      });    
      Page.findOne({_id: pageid}).exec(function(err, page){
          console.log('Error: ' + err);
          console.log('Page: ' + page);
          if(page){
              res.render('editpage', {page: page, errors: errors.array(), header: newHeader });
          }
          else{
              res.send('No Page found with that id...');
          }
      });
  }
  else{
      var pageTitle = req.body.pageTitle;
      var pageDetail = req.body.pageDetail;

      if(!req.files) {
        Header.findOne({}).exec(function(err, header){
          console.log(err);
          newHeader = header;
        });
        res.render('adminTemp', { adminTitle: 'Error', adminMsg: 'You must upload an image when editing a page!', header: newHeader });
      }
      else {
        var heroImageName = req.files.heroImage.name;
        var id = req.params.id;
        Page.findOne({_id:id}, function(err, page){
            page.pageTitle = pageTitle;
            page.pageDetail = pageDetail;
            page.heroImageName = heroImageName;
            page.save();     
        });
        Header.findOne({}).exec(function(err, header){
          newHeader = header;
        });
        res.render('adminTemp', {adminTitle: 'Edit Page', adminMsg: 'You have successfully edited the page!', header: newHeader});
      }
    } 
});

//logout page
 myApp.get("/logout", function (req, res) {
  req.session.username = '';
  req.session.userLoggedIn = false;
  Header.findOne({}).exec(function(err, header){
    console.log(err);
    newHeader = header;
  });
  res.render("adminTemp", { adminTitle: 'Logout', adminMsg: 'You have successfully Logged out!', header:newHeader});
 });


//submitting login credentials
myApp.post("/login", function (req, res) {
  console.log('new header is ' + newHeader);
  var username = req.body.username;
  var password = req.body.password;

  Admin.findOne({ username: username, password: password }).exec(function (err, admin) 
  {
    // log any errors
    console.log("Error: " + err);
    console.log("Admin: " + admin);
    if (admin) {
      //store username in session and set logged in true
      req.session.username = admin.username;
      req.session.userLoggedIn = true;
      Header.findOne({}).exec(function(err, header){
        console.log(err);
        newHeader = header;
      });
      res.render("adminTemp", { adminTitle: 'Welcome', adminMsg: 'Hello Admin, Welcome to the dashboard!', header:newHeader});
    } 
    else {
      res.redirect('/login');
    }
  });
});

//new page
myApp.get('/:pageid', function(req, res){
  var pageid = req.params.pageid;
  var allpages;
  var newHeader;
  Header.findOne({}).exec(function(err, header){
    newHeader = header;
  });
  Page.find({}).exec(function(err, pages){
    allpages = pages;
  });
  Page.findOne({_id: pageid}).exec(function(err, page){
      console.log('Error: ' + err);
      console.log('Page: ' + page);
      if(page){          
        res.render('newpage', {page: page, pages: allpages, header: newHeader});
      }
      else{
        res.send('No page found with that id...');
      }
  });
});


// start the server and listen at a port
myApp.listen(8080);

//tell everything was ok
console.log(
  "Everything executed fine.. website at port http://localhost:8080...."
);
