const User = require("../models/user");
const bcryptjs = require("bcryptjs");

exports.getLogin = (req, res) => {
  let message = req.flash('error');
  if(message.length > 0) {
    message = message[0];
  } else {
    message = undefined;
  }
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: message,
  });
};

exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect("/login");
      }
      bcryptjs.compare(password, user.password).then((result) => {
        if (result) {
          req.session.isLoggedIn = true;
          req.session.userData = user;
          return req.session.save((err) => {
            console.log(err);
            res.redirect("/");
          });
        }
        req.flash('error', 'Invalid email or password.');
        res.redirect("/login");
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
  let message = req.flash('existingEmail');
  if(message.length > 0) {
    message = message[0];
  } else {
    message = undefined;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
    errorMessage: message
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash('existingEmail', 'This E-mail is already being used!')
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
