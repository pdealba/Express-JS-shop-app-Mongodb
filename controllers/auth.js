const User = require("../models/user");
const bcryptjs = require("bcryptjs");

exports.getLogin = (req, res) => {
  // const isLoggedIn = req.get('Cookie').split('=')[1] === 'true'
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.redirect("/login");
      }
      bcryptjs.compare(password, user.password).then((result) => {
        if (!result) {
          return res.redirect("/login");
        }
        req.session.isLoggedIn = true;
        req.session.userData = user;
        return req.session.save((err) => {
          console.log(err);
          res.redirect("/");
        });
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        return res.redirect("/signup");
      }
      return bcryptjs
        .hash(password, 12)
        .then((hashPassword) => {
          const newUser = new User({
            email,
            password: hashPassword,
            cart: { items: [] },
          });
          return newUser.save();
        })
        .then((result) => {
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};
