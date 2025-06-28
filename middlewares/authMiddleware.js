import jwt from 'jsonwebtoken';

const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Not authorized." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export default isAuthenticated;