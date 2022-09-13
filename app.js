const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const connectSession = require("connect-mongodb-session")(session);
const csrf = require('csurf');
const flash = require('connect-flash')

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();
const store = new connectSession({
  uri: "mongodb+srv://pedroDeAlba123:Paraiso22@cluster0.zfzxf.mongodb.net/shop",
  collection: "session",
});''
const csrfProtection = csrf();

app.set("view engine", "ejs");

const admitRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.userData) {
    return next();
  }
  User.findById(req.session.userData._id)
    .then((user) => {
      req.user = user;
      next()
    })
    .catch((err) => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", admitRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://pedroDeAlba123:Paraiso22@cluster0.zfzxf.mongodb.net/shop?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
