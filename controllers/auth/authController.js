import User from "../../models/user/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendEmail } from "../../utils/sendEmail.js";
import { isValidUsername } from "../../utils/ValidateCredentials.js";
import { isValidPassword } from "../../utils/ValidateCredentials.js";
import { isValidEmail } from "../../utils/ValidateCredentials.js";
import { encryptToken } from "../../utils/tokenCrypto.js";
import { loginValidation, signupValidation } from "../../utils/validations.js";
import { compareHashPassword, hashPassword, normalizePath, signJWT } from "../../utils/helper.js";

// signUpController:
export const signUpController = async (req, res) => {
  const validate = signupValidation.safeParse(req.body);
  if (!validate.success) {
    const firstError = validate.error?.issues[0].message || "Invalid";
    return res.error(400,firstError );
  }
  const avatar = normalizePath(req.file?.path);
  const { username, email, password } = validate.data;

  const exsitUser = await User.findOne({ email });
  if (exsitUser) {
    return res.error(409,"User already exist!");
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

  // const { username, email, password } = req.body;
  // const profilePic = req.file?.filename;

  // if (!isValidUsername(username)) {
  //   return res.status(400).json({
  //     message:
  //       "Username must be 3-20 characters long and can only contain letters, numbers, and underscores.",
  //   });
  // }

  // if (!isValidEmail(email)) {
  //   return res
  //     .status(400)
  //     .json({ message: "Please provide a valid email address." });
  // }

  // if (!isValidPassword(password)) {
  //   return res.status(400).json({
  //     message:
  //       "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
  //   });
  // }

  // // Check if user already exists
  // const existUser = await User.findOne({ email });
  // if (existUser) {
  //   return res.status(409).json({ message: "User already exists!" });
  // }

  // const saltRounds = 10;
  // const hashedPassword = await bcrypt.hash(password, saltRounds);

  // const user = new User({
  //   username,
  //   email,
  //   password: hashedPassword,
  //   profilePic,
  //   role: 'user',
  // });
  // await user.save();

  // const token = jwt.sign(
  //   { id: user._id, username: user.username, email: user.email, role: user.role },
  //   process.env.JWT_SECRET,
  //   { expiresIn: "1d" }
  // );

  // const encryptedToken = encryptToken(token);

  // res.cookie("token", encryptedToken, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  //   maxAge: 24 * 60 * 60 * 1000,
  // });

  // await sendEmail(user.email, "Welcome to KICKS!", "auth/welcome", {
  //   username,
  // });

  // return res.status(201).json({
  //   message: "User signed up successfully!",
  //   profileUrl: profilePic ? `/uploads/${profilePic}` : null,
  // });
};

// loginController:
export const loginController = async (req, res) => {
  const validate = loginValidation.safeParse(req.body);
  if(!validate.success){
    const firstError = validate.error.issues[0].message || 'Invalid';
    return res.error(400, firstError)
  }
  const {email, password} = validate.data;
  const user = await User.findOne({email}).select("+password");
  if(!user){
    return res.error(404, 'Please sign up first!');
  }
  const isMatch = await compareHashPassword(password, user.password);
  if(!isMatch){
    return res.error(401, 'Incorrect password');
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

  return res.success(200, 'Successfully login!', user)

  
  // try {
  //   const { email, password } = req.body;

  //   const user = await User.findOne({ email });
  //   if (!user) {
  //     return res.status(404).json({ message: "Please sign up first!" });
  //   }

  //   const isMatch = await bcrypt.compare(password, user.password);
  //   if (!isMatch) {
  //     return res.status(401).json({ message: "Wrong Password!" });
  //   }

  //   const token = jwt.sign(
  //     {
  //       id: user._id,
  //       username: user.username,
  //       email: user.email,
  //       role: user.role,
  //     },
  //     process.env.JWT_SECRET,
  //     { expiresIn: "1d" }
  //   );
  //   console.log("token", token);

  //   const encryptedToken = encryptToken(token);

  //   res.cookie("token", encryptedToken, {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === "production",
  //     sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  //     maxAge: 24 * 60 * 60 * 1000,
  //   });

  //   return res.status(200).json({ message: "User successfully logged in!" });
  // } catch (e) {
  //   console.log(e);
  //   res.status(500).json({ message: "Login failed!" });
  // }
};

// logoutController:
export const logoutController = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      expires: new Date(0),
    });

    // Logout verified email:
    const userEmail = req.user?.email;

    // if (userEmail) {
    //   await sendEmail(
    //     userEmail,
    //     "Logout Confirmation",
    //     "You have successfully logged out from KICKS."
    //   );
    // }

    return res.status(200).json({ message: "User logged out successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Logout failed" });
  }
};

// meController:
export const meController = async (req, res) => {
  try {
    // const {id} = req?.user;
    const user = await User.findById(req?.user?.id).select(
      "username email avatar role"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: "User is authenticated!",
      user,
    });
  } catch (error) {
    console.log(e);
    res.status(500).json({ message: "Failed" });
  }
};

// Send verify email OTP:
export const sendVerifyEmailOtpController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isAccountVerified) {
      return res.status(200).json({ message: "Account is already verified!" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.save();

    const username = user.username;

    await sendEmail(
      user.email,
      "Account Verification OTP",
      "auth/verifyEmailOTP",
      { username, otp, year: 2025 }
    );

    return res
      .status(200)
      .json({ message: "Verification OTP sent successfully!" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to send verification OTP." });
  }
};

// Verify Email:
export const verifyEmailController = async (req, res) => {
  try {
    const { verifyOtp } = req.body;
    // const email = req.user?.email;

    const user = await User.findOne({ verifyOtp });
    if (!user) {
      return res.status(404).json({ message: "Invalid OTP!" });
    }
    if (Date.now() > user.verifyOtpExpireAt) {
      return res.status(400).json({ message: "OTP Expired!" });
    }
    if (verifyOtp !== user.verifyOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = null;
    user.verifyOtpExpireAt = null;

    await user.save();

    return res.status(200).json({ message: "Email successfully verified!" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong during verification." });
  }
};

// Send resetPassword OTP controller:
export const sendResetPasswordOtpController = async (req, res) => {
  try {
    // console.log("Req body:",req.body );

    const email = req.body.email;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isAccountVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your account first!" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    await sendEmail(
      user.email,
      "Reset Password OTP",
      "auth/reset-password-otp",
      { otp, year: 2025 }
    );

    return res
      .status(200)
      .json({ message: "Reset password OTP sent successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Verify Reset Password Controller:
export const verifyResetPasswordOtpController = async (req, res) => {
  try {
    const { email, resetOtp, newPassword } = req.body;

    if (!email || !resetOtp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password are required." });
    }
    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.resetOtp !== resetOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (
      !user.resetOtpExpireAt ||
      Date.now() > new Date(user.resetOtpExpireAt).getTime()
    ) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpireAt = null;

    await user.save();

    return res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Check isAccountVerified status:
export const checkEmailVerificationStatus = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.isAccountVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your account first!" });
    }

    return res.status(200).json({ message: "Email is verified." });
  } catch (error) {
    console.error("Email verification check failed:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
