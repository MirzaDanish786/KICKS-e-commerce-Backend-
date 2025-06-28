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
} from "../controllers/authController.js";
import isAuthenticated from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/signup", upload.single('profilePic'), signUpController);
router.post("/login", loginController);
router.post("/check-email-verification", checkEmailVerificationStatus);
router.post("/send-reset-otp", sendResetPasswordOtpController );
router.post("/verify-reset-otp", verifyResetPasswordOtpController );
router.post("/send-verify-otp", sendVerifyEmailOtpController);
router.post("/verify-email", verifyEmailController );

// Routes that use isAuthenticated Middleware:f
router.use(isAuthenticated);
router.post('/logout', logoutController);
router.get("/me", meController);

export default router;
