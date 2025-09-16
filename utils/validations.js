import { z } from "zod";
export const addReviewValidation = z.object({
  productId: z.string().nonempty("Product Id is required"),
  rating: z
    .string()
    .nonempty("Rating is required")
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), "Rating must be a number")
    .refine((val) => val >= 1 && val <= 5, "Rating must be between 1 and 5"),
  comment: z.string().optional(),
});
export const signupValidation = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters long")
      .max(30, "Username must not exceed 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),

    email: z
      .string()
      .nonempty("Email is required")
      .email("Invalid email format"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(64, "Password must not exceed 64 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&]/,
        "Password must contain at least one special character (@, $, !, %, *, ?, &)"
      ),

    confirmPassword: z.string().nonempty("Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginValidation = z.object({
  email: z.string().nonempty("Email is required").email("Invalid email format"),

  password: z.string().nonempty("Password is required"),
});

export const verifyEmailControllerValidation = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
  verifyEmailToken: z.string().trim(),
});

export const emailValidation = z.object({
  email: z.string().trim().email({ message: "Invalid email address." }),
});

export const otpValidation = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export const verifyResetPasswordOtpSchema = z
  .object({
    resetPasswordToken: z.string().nonempty("Token is required"),
    otp: z
      .string()
      .length(6, "OTP must be 6 digits")
      .regex(/^\d+$/, "OTP must contain only numbers"),

    resetPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(64, "Password must not exceed 64 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&]/,
        "Password must contain at least one special character (@, $, !, %, *, ?, &)"
      ),

    confirmPassword: z.string().nonempty("Confirm Password is required"),
  })
  .refine((data) => data.resetPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // error will appear under confirmPassword
  });
