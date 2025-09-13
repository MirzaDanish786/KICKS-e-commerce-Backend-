import express from "express";
import {
  confirmUpdateEmailController,
  deleteUserController,
  getAllUserController,
  getSingleUserController,
  updateEmailController,
  updatePasswordController,
  updateUsernameController,
} from "../controllers/user/userController.js";
import isAuthenticated from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

// Account mange routes:
router.patch("/update-username", isAuthenticated, updateUsernameController);
router.patch("/update-password", isAuthenticated, updatePasswordController);
router.patch("/update-email", isAuthenticated, updateEmailController);
router.get("/confirm-email-update", confirmUpdateEmailController);

router.use(isAuthenticated, isAdmin);
router.get("/", getAllUserController);
router.get("/:id", getSingleUserController);
router.delete("/:id", deleteUserController);

 
export default router;
