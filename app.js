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
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("631a5205cf02c1d8fa3c3e09")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use((req, res, next) => {
	const cookies = req.get('Cookie').split('; ');
	res.locals.isAuthenticated = false;
	cookies.forEach(cookie => {
		const key = cookie.split('=')[0];
		if (key === 'loggedIn') {
			const value = cookie.split('=')[1];
			if (value === 'true') {
				res.locals.isAuthenticated = true;
			}
		}
	});
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
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          username: "Pedro",
          email: "pedro@test.com",
          cart: { items: [] },
        });
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch((err) => console.log(err));
