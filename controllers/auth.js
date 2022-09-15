const bcryptjs = require("bcryptjs");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");

const crypto = require("crypto");
const user = require("../models/user");

const transporter = nodemailer.createTransport(
  sendGridTransport({
    auth: {
      api_key:
        "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",
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
  });
};

exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password.");
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
        req.flash("error", "Invalid email or password.");
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
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("existingEmail", "This E-mail is already being used!");
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
          return transporter.sendMail({
            to: email,
            from: "pedrodealbaalegre@gmail.com",
            subject: "Signup completed!",
            html: "<h1>You have succesfully created an account!</h1>",
          });
        })
        .catch((err) => console.log(err));
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
            from: "pedrodealbaalegre@gmail.com",
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
    .catch(err => console.log(err))
};
