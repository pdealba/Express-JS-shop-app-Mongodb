const Product = require("../models/product");

exports.getAddProduct = (req, res) => {
  // res.sendFile(path.join(rootDir, "views", "add-product.html"));
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    // formsCSS: true,
    // productCSS: true,
    // activeAddProduct: true,
  });
};

exports.postAddProduct = (req, res) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  req.user
    .createProduct({
      title,
      imageUrl,
      price,
      description,
    })
    .then((result) => {
      console.log("Created a Product");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.getEditProduct = (req, res) => {
  const prodId = req.params.productId;
  req.user
    .getProducts({ where: { id: prodId } })
    .then((products) => {
      const product = products[0];
      const editMode = req.query.edit;
      if (!editMode) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res) => {
  const prodId = req.body.productId;
  const uTitle = req.body.title;
  const uImageUrl = req.body.imageUrl;
  const uPrice = req.body.price;
  const uDescription = req.body.description;
  Product.findByPk(prodId)
    .then((product) => {
      product.title = uTitle;
      product.imageUrl = uImageUrl;
      product.price = uPrice;
      product.description = uDescription;
      return product.save();
    })
    .then((result) => {
      console.log("UPDATED PRODUCT");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res) => {
  req.user
    .getProducts()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        path: "/admin/products",
        pageTitle: "Admin Products",
      });
    })
    .catch((err) => console.log(err));
};


exports.postDeleteProduct = (req, res) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
    .then((product) => {
      return product.destroy();
    })
    .then((result) => {
      console.log("PRODUCT DELETED");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};