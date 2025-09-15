import express from "express";
import {
  checkEmailVerificationStatus,
  loginController,
  logoutController,
  meController,
  sendResetPasswordOtpController,
  sendVerifyEmailOtpController,
  signUpController,
  verifyEmailController,
  verifyResetPasswordOtpController,
} from "../controllers/auth/authController.js";
import isAuthenticated from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/signup", upload.single('avatar'), signUpController);
router.post("/login", loginController);
router.get("/email/status", checkEmailVerificationStatus);
router.post("/password/otp", sendResetPasswordOtpController );
router.post("/password/verify", verifyResetPasswordOtpController );
router.post("/email/otp", sendVerifyEmailOtpController);
router.post("/email/verify", verifyEmailController );

// Routes that use isAuthenticated Middleware:f
router.use(isAuthenticated);
router.post('/logout', logoutController);
router.get("/me", meController);

export default router;
