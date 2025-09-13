// tokenCrypto.js
import crypto from "crypto";

const algorithm = "aes-256-cbc";

// Encrypt JWT before storing in cookie
export const encryptToken = (token) => {
  const secret = process.env.CRYPTO_SECRET;
  console.log(secret );
  
  if (!secret || secret.length !== 32) {
    throw new Error("CRYPTO_SECRET must be defined and 32 characters long");
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secret, iv);
  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

// Decrypt JWT when reading from cookie
export const decryptToken = (encryptedToken) => {
  const secret = process.env.CRYPTO_SECRET;
  if (!secret || secret.length !== 32) {
    throw new Error("CRYPTO_SECRET must be defined and 32 characters long");
  }

  const [ivHex, encrypted] = encryptedToken.split(":");
  const decipher = crypto.createDecipheriv(
    algorithm,
    secret,
    Buffer.from(ivHex, "hex")
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
