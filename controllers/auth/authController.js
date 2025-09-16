import User from "../../models/user/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendEmail } from "../../utils/sendEmail.js";
import { isValidUsername } from "../../utils/ValidateCredentials.js";
import { isValidPassword } from "../../utils/ValidateCredentials.js";
import { isValidEmail } from "../../utils/ValidateCredentials.js";
import { decryptToken, encryptToken } from "../../utils/tokenCrypto.js";
import {
  loginValidation,
  otpValidation,
  signupValidation,
  emailValidation,
  verifyEmailControllerValidation,
  verifyResetPasswordOtpSchema,
} from "../../utils/validations.js";
import {
  compareHashPassword,
  generateOTP,
  hashPassword,
  normalizePath,
  signJWT,
  verifyJWT,
} from "../../utils/helper.js";

// signUpController:
export const signUpController = async (req, res) => {
  const validate = signupValidation.safeParse(req.body);
  if (!validate.success) {
    const firstError = validate.error?.issues[0].message || "Invalid";
    return res.error(400, firstError);
  }
  const avatar = normalizePath(req.file?.path);
  const { username, email, password } = validate.data;

  const exsitUser = await User.findOne({ email });
  if (exsitUser) {
    return res.error(409, "User already exist!");
  }

  const hashedPassword = await hashPassword(password);
  const user = new User({
    username,
    email,
    password: hashedPassword,
    avatar,
    role: "user",
  });
  await user.save();

  const token = signJWT(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    "1d"
  );

  const encryptedToken = encryptToken(token);

  res.cookie("authToken", encryptedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  await sendEmail(user.email, "Welcome to KICKS🎉", "auth/welcome", {
    username,
  });
  return res.success(201, "Signup successfully!", user);
};

// loginController:
export const loginController = async (req, res) => {
  const validate = loginValidation.safeParse(req.body);
  if (!validate.success) {
    const firstError = validate.error.issues[0].message || "Invalid";
    return res.error(400, firstError);
  }
  const { email, password } = validate.data;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.error(404, "Please sign up first!");
  }
  const isMatch = await compareHashPassword(password, user.password);
  if (!isMatch) {
    return res.error(401, "Incorrect password");
  }
  const authToken = signJWT(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    "1d"
  );

  const encryptedToken = encryptToken(authToken);
  res.cookie("authToken", encryptedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.success(200, "Successfully login!", user);
};

// logoutController:
export const logoutController = async (req, res) => {
  res.cookie("authToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    expires: new Date(0),
  });
  return res.success(200, "Successfully logged out!");
};

// meController:
export const meController = async (req, res) => {
  const id = req.user?.id;
  const user = await User.findById(id);
  if (!user) {
    return res.error(404, "User not found!");
  }
  return res.success(200, "User fetched successfully!", user);
};

// Send verify email OTP:
export const sendVerifyEmailOtpController = async (req, res) => {
  const validate = emailValidation.safeParse(req.body);
  if (!validate.success) {
    return res.error(400, validate.error.issues[0].message || "Invalid email");
  }
  const { email } = validate.data;
  const user = await User.findOne({ email });
  if (!user) {
    return res.error(404, "User not found!");
  }
  if (user.isAccountVerified) {
    return res.error(400, "Account already verified!");
  }
  const otp = generateOTP();
  const verifyEmailToken = signJWT({ id: user._id }, "10min");
  user.verifyOtp = otp;
  user.verifyOtpExpireAt = new Date(Date.now() + 10 * 60 * 1000);
  user.verifyEmailToken = verifyEmailToken;
  await user.save();

  await sendEmail(
    user.email,
    "Account Verification OTP",
    "auth/verifyEmailOTP",
    { username: user.username, otp, year: new Date().getFullYear() }
  );

  return res.success(200, "Verification OTP sent successfully!", {
    verifyEmailToken: user.verifyEmailToken,
  });
};

// Verify Email:
export const verifyEmailController = async (req, res) => {
  const validate = verifyEmailControllerValidation.safeParse(req.body);
  if (!validate.success) {
    return res.error(400, validate.error.issues[0].message || "Invalid OTP");
  }
  const { otp, verifyEmailToken } = validate.data;

  const decoded = verifyJWT(verifyEmailToken);

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.error(404, "Invalid or expired OTP.");
  }
  if (Date.now() > user.verifyOtpExpireAt) {
    return res.error(401, "OTP has expired.");
  }
  if (user.verifyOtp !== otp) {
    return res.error(400, "Incorrect OTP. Please try again.");
  }

  user.isAccountVerified = true;
  user.verifyOtp = null;
  user.verifyEmailToken = null;
  user.verifyOtpExpireAt = null;

  await user.save();

  return res.success(200, "Email verified successfully!");
};

// Send resetPassword OTP controller:
export const sendResetPasswordOtpController = async (req, res) => {
  const validete = emailValidation.safeParse(req.body);
  if (!validete.success) {
    return res.error(400, validete.error.issues[0].message || "Ivalid email");
  }
  const { email } = validete.data;
  const user = await User.findOne({ email });
  if (!user) {
    return res.error(404, "Please signup first!");
  }
  if (!user.isAccountVerified) {
    return res.error(401, "Please verify your account first");
  }

  const otp = generateOTP();
  const verifyResetToken = signJWT({ id: user._id }, "10min");

  user.resetOtp = otp;
  user.resetPasswordToken = verifyResetToken;
  user.resetOtpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  await sendEmail(user.email, "Reset Password OTP", "auth/reset-password-otp", {
    otp,
    year: new Date().getFullYear(),
  });
  return res.success(200, "Reset OTP send successfully", {
    resetPasswordToken: user.resetPasswordToken,
  });
};

// Verify Reset Password Controller:
export const verifyResetPasswordOtpController = async (req, res) => {
  const validate = verifyResetPasswordOtpSchema.safeParse(req.body);
  if (!validate.success) {
    return res.error(400, validate.error.issues[0].message || "Invalid");
  }
  const { otp, resetPasswordToken, resetPassword } = validate.data;

  const decoded = verifyJWT(resetPasswordToken);

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.error(400, "Invalid or expried OTP!");
  }
  if (user.resetOtp !== otp) {
    return res.error(400, "Incorrect OTP");
  }
  if (Date.now() > user.resetOtpExpireAt) {
    return res.error(401, "OTP expired!");
  }
  const hashedPassword = await hashPassword(resetPassword);
  user.password = hashedPassword;
  user.resetOtp = null;
  user.resetPasswordToken = null;
  user.resetOtpExpireAt = null;
  await user.save();

  return res.success(200, "Password reset successfully!");
};

// Check email verification status
export const checkEmailVerificationStatus = async (req, res) => {
  const validate = emailValidation.safeParse(req.query);
  if (!validate.success) {
    return res.error(400, validate.error.issues[0].message || "Invalid email");
  }

  const { email } = validate.data;

  const user = await User.findOne({ email });
  if (!user) {
    return res.error(404, "User not found!");
  }

  if (!user.isAccountVerified) {
    return res.error(403, "Please verify your account first!");
  }

  return res.success(200, "Email is verified.", {
    email: user.email,
    isVerified: true,
  });
};
