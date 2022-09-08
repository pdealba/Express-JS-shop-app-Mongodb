const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const mongoose = require("mongoose");

const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");

const admitRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("630f83c91e783a4bf45626ff")
    .then((user) => {
      req.user = new User(user.username, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", admitRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://pedroDeAlba123:Paraiso22@cluster0.zfzxf.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(result => {
    app.listen(3000);
  })
  .catch(err => console.log(err));
