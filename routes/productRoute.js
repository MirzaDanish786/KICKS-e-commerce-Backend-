import express from "express";
import {
  addProductController,
  deleteProductController,
  getAllProductsController,
  getProductController,
  updateProductController,
} from "../controllers/productController.js";
import isAdmin from "../middlewares/isAdmin.js";
import isAuthenticated from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/:id", getProductController);
router.get("/", getAllProductsController);
router.post("/", isAuthenticated, isAdmin, addProductController);
router.put("/update/:id", isAuthenticated, isAdmin, updateProductController);
router.delete("/delete/:id", isAuthenticated, isAdmin, deleteProductController);

export default router;
