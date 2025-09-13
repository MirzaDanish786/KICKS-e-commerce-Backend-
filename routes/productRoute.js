import express from "express";
import {
  addProductController,
  deleteProductController,
  getAllProductsController,
  getAllProductsWithReviewsController,
  getProductController,
  updateProductController,
} from "../controllers/product/productController.js";
import isAdmin from "../middlewares/isAdmin.js";
import isAuthenticated from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";
const router = express.Router();

router.get("/", getAllProductsController);
router.get('/reviews', getAllProductsWithReviewsController);
router.get("/:id", getProductController);
router.post("/", isAuthenticated, isAdmin, upload.single('image'), addProductController);
router.put("/update/:id", isAuthenticated, isAdmin, upload.single('image'), updateProductController);
router.delete("/delete/:id", isAuthenticated, isAdmin, deleteProductController);

export default router;
