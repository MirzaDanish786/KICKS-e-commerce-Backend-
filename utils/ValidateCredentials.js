// Utility functions for validation
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidUsername = (username) =>
  typeof username === "string" &&
  username.length >= 3 &&
  username.length <= 20 &&
  /^[a-zA-Z0-9_]+$/.test(username);

export const isValidPassword = (password) =>
  typeof password === "string" &&
  password.length >= 8 &&
  /[A-Z]/.test(password) && // at least one uppercase
  /[a-z]/.test(password) && // at least one lowercase
  /[0-9]/.test(password) && // at least one digit
  /[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(password); // at least one special char