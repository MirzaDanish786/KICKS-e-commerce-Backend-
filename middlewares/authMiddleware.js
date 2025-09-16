import jwt from "jsonwebtoken";
import { decryptToken } from "../utils/tokenCrypto.js";
import { verifyJWT } from "../utils/helper.js";

const isAuthenticated = (req, res, next) => {
  const encryptedToken = req.cookies.authToken;

  if (!encryptedToken) {
    return res.status(401).json({ message: "Not authorized." });
  }

  try {
    const decryptedToken = decryptToken(encryptedToken);  
    const decoded = verifyJWT(decryptedToken) ;
    req.user = decoded;
    console.log(decoded)
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export default isAuthenticated;
