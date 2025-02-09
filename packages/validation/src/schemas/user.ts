import { z } from "zod";

export const idSchema = z.string();

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(50, "Username must be less than 50 characters");

export const emailSchema = z.string().email("Invalid email address");

export const signUpSchema = z.object({
  id: idSchema,
  username: usernameSchema,
  email: emailSchema,
});
