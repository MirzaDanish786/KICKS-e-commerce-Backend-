import jwt from "jsonwebtoken";
import { decryptToken } from "../utils/tokenCrypto.js";

const isAuthenticated = (req, res, next) => {
  const encryptedToken = req.cookies.token;

  if (!encryptedToken) {
    return res.status(401).json({ message: "Not authorized." });
  }

  try {
    const decryptedToken = decryptToken(encryptedToken);  
    const decoded = jwt.verify(decryptedToken, process.env.JWT_SECRET);  
    req.user = decoded;
    console.log(decoded)
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export default isAuthenticated;
