const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = (req, res) => {
  Product.find()
    // .select('title price -_id')
    // .populate('UserId', 'username')
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        path: "/products",
        pageTitle: "All Products",
        isAuthenticated: req.session.isLoggedIn
      });
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        path: "/",
        pageTitle: "Shop",
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res) => {
  req.session.userData
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.session.userData.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    });
};

exports.postCartDeleteProduct = (req, res) => {
  const prodId = req.body.productId;
  req.session.userData
    .deleteCartItem(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res) => {
  req.session.userData
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { product: { ...i.productId._doc }, quantity: i.quantity };
      });
      const order = new Order({
        products,
        user: {
          userId: req.session.userData,
          username: req.session.userData.username,
        },
      });
      return order.save();
    })
    .then((result) => {
      req.session.userData.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res) => {
  Order.find({ "user.userId": req.session.userData._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => console.log(err));
};
