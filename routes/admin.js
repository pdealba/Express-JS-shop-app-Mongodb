const path = require("path");
const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");
const { body } = require("express-validator/check");
const isAuth = require("../middleware/is-auth");

router.get("/add-product", isAuth, adminController.getAddProduct);

router.post(
  "/add-product",
  [
    body("title").isLength({ min: 5, max: 50 }).withMessage('Title must have a minimum of 5 character and a maximum of 50!'),
    body("imageUrl").isURL().withMessage('Please enter a valid URL'),
    body("price").isAlphanumeric().withMessage('The price field must cotain numbers only!'),
    body("description").isLength({ min: 5, max: 500 }).withMessage('Description must have a minimum of 5 character and a maximum of 500!'),
  ],
  isAuth,
  adminController.postAddProduct
);

router.get("/products", isAuth, adminController.getProducts);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post("/edit-product", isAuth, adminController.postEditProduct);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
