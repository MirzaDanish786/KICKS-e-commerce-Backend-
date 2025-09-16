import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const createSlug = (val) => {
  return val
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
};

export const normalizePath = (filePath) => {
  if (!filePath) return filePath;
  return `/${filePath.replace(/\\/g, "/")}`;
};

export const hashPassword = async (password, saltRounds = 10) => {
  return await bcrypt.hash(password, saltRounds);
};
export const compareHashPassword = async (enteredPassword, actualPassword) => {
  return await bcrypt.compare(enteredPassword, actualPassword);
};
export const signJWT = (payload, expiresIn) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};
export const verifyJWT = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
export const generateOTP = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};
