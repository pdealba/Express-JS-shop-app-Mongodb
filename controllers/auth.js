const User = require('../models/user');

exports.getLogin = (req, res) => {
  // const isLoggedIn = req.get('Cookie').split('=')[1] === 'true'
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.postLogin = (req, res) => {
  User.findById("631a5205cf02c1d8fa3c3e09")
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.userData = user;
      req.session.save(err => {
        console.log(err)
        res.redirect("/");
      })
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err)
    res.redirect('/');
  })
}
