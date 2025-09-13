import User from "../../models/user/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/sendEmail.js";
import { isValidPassword } from "../../utils/ValidateCredentials.js";

// Get all user:
export const getAllUserController = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Single user by id:
export const getSingleUserController = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete user by id:
export const deleteUserController = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res
      .status(200)
      .json({ message: "User Deleted Successfully!", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update User Name:
export const updateUsernameController = async (req, res) => {
  try {
    const { id } = req.user;
    const { username } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.username = username;
    await user.save();
    return res.status(201).json({ message: "Name changed successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Update password:
export const updatePasswordController = async (req, res) => {
  try {
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid old password!" });
    }
    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({ message: "Password changed successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update email:
export const updateEmailController = async (req, res) => {
  try {
    const { id } = req.user;
    const { password, newEmail } = req.body;
    if (!password || !newEmail) {
      return res.status(400).json({ message: "Both fields are required" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }
    const existEmail = await User.findOne({ email: newEmail });
    if (existEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = jwt.sign(
      { id: user._id, newEmail: newEmail },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const confirmUrl = `${process.env.BASE_URL}/api/users/confirm-email-update?token=${token}`;

    await sendEmail(newEmail, "Email Confirmation", "auth/confirm-email", {
      confirmUrl,
    });

    res.status(200).json({
      message: "A confirmation email has been sent to your new email address.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Confirm Update Email:
export const confirmUpdateEmailController = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Token is missing" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.email = decoded.newEmail;
    await user.save();
    res.clearCookie("token");
    return res.redirect(
      `http://localhost:5173/login?emailUpdated=true&newEmail=${encodeURIComponent(
        decoded.newEmail
      )}`
    );
  } catch (error) {
    console.log(error);
    return res.redirect(
      "http://localhost:5173/manage-account?emailUpdated=false"
    );
  }
};
