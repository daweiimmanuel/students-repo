var cookieParser = require("cookie-parser"),
    bodyParser  = require("body-parser"),
    expressValidator = require("express-validator"),
    mongoose    = require("mongoose"),
    passport = require("passport"),
    LocalStrategy   = require("passport-local"),
    express = require("express"),
    app     = express();

var index = require("./routes/index"),
    catalog = require("./routes/catalog");
    
var async = require("async");
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var flash = require('express-flash');
    
var User = require("./models/user");
    
mongoose.connect("mongodb://localhost/students-repo");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());
app.use(flash());

//PASSPORT CONFIG
app.use(require("express-session")({
    secret: "Alfalink Semarang Data Repository!",
    resave: false,
    saveUninitialized: false
}));
passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({ username: username }, function(err, user) {
    if (err) return done(err);
    if (!user) return done(null, false, { message: 'Incorrect username.' });
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    });
  });
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.info = req.flash("info");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", index);
app.use("/catalog", catalog);

//AUTH ROUTES
app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", isLoggedIn, function(req, res){
    var user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });

      user.save(function(err) {
            req.flash("success", "Successfully Add New User: " + req.body.username);
          res.redirect('/catalog');
      });
});

//show login form
app.get("/login", function(req, res){
    res.render("login");
});

//handling login logic
app.post("/login", function(req, res, next){
    passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);
    if (!user) {
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      return res.redirect('/catalog');
    });
  })(req, res, next);
});

//logout logic
app.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "LOGGED YOU OUT!");
    res.redirect("/login");
});

//forgot logic
app.get("/forgot", function(req, res) {
    res.render("forgot");
});

app.post("/forgot", function(req, res, next){
    async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ 'email': req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect("/forgot");
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'dawei.immanuel@gmail.com',
                pass: '88904188'
            }
        });
      var mailOptions = {
        to: user.email,
        from: 'dawei.immanuel@gmail.com',
        subject: 'Data Repository Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect("/forgot");
  });
});

app.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {
      user: req.user
    });
  });
});

app.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
        console.log(req.params.token);
        
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    },
    function(user, done) {
      let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'dawei.immanuel@gmail.com',
                pass: '88904188'
            }
        });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/catalog');
  });
});

//function isLoggedIn
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must be signed in to do that!");
    res.redirect("/login");
}

app.listen(3000, process.env.IP, function(){
    console.log("SERVER IS RUNNING on localhost:3000...");
});