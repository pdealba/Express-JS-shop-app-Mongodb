require("dotenv").config();

const bcryptjs = require("bcryptjs");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");

const crypto = require("crypto");
const user = require("../models/user");

const { validationResult } = require("express-validator/check");

const transporter = nodemailer.createTransport(
  sendGridTransport({
    auth: {
      api_key: process.env.SHOP_API_KEY,
    },
  })
);

exports.getLogin = (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = undefined;
  }

  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
      },
      validationErrors: errors.array(),
    });
  }  

  User.findOne({ email: email })
  .then(user => {
    if (!user) {
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: 'Invalid email or password.',
        oldInput: {
          email: email,
          password: password
        },
        validationErrors: []
      });
    }

    bcrypt
    .compare(password, user.password)
    .then(doMatch => {
      if (doMatch) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save(err => {
          console.log(err);
          res.redirect('/');
        });
      }
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: 'Invalid email or password.',
        oldInput: {
          email: email,
          password: password
        },
        validationErrors: []
      });
    })
    .catch(err => {
      console.log(err);
      res.redirect('/login');
    });
})
.catch(err => console.log(err));
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("existingEmail");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = undefined;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  bcryptjs
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
      return transporter.sendMail({
        to: email,
        from: "node@shop.com",
        subject: "Signup completed!",
        html: "<h1>You have succesfully created an account!</h1>",
      });
    })
    .catch((err) => console.log(err));
};

exports.getReset = (req, res) => {
  let message = req.flash("err");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = undefined;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res) => {
  const token = crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    const expirationDate = Date.now() + 3600000;

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("err", "This email does not exist!");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.tokenExpirationDate = expirationDate;
        return user.save().then((result) => {
          res.redirect("/");
          transporter.sendMail({
            from: "node@shop.com",
            to: req.body.email,
            subject: "Reset Password",
            html: `
          <p> You have requested a password Reset: </p>
          <p> Click on the following <a href="http://localhost:3000/reset/${token}">link</a> to reset your password  </p>
          `,
          });
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassword = (req, res) => {
  const token = req.params.token;

  User.findOne({
    resetToken: token,
    tokenExpirationDate: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        return res.redirect("/");
      }
      let message = req.flash("err");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = undefined;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        token,
      });
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res) => {
  const newPassword = req.body.newPassword;
  const passwordToken = req.body.token;
  const userId = req.body.userId;

  let userDoc;

  User.findOne({
    resetToken: passwordToken,
    _id: userId,
    tokenExpirationDate: { $gt: Date.now() },
  })
    .then((user) => {
      userDoc = user;
      return bcryptjs.hash(newPassword, 12);
    })
    .then((hashPassword) => {
      userDoc.password = hashPassword;
      userDoc.resetToken = undefined;
      userDoc.tokenExpirationDate = undefined;
      return userDoc.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => console.log(err));
};
