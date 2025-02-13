import * as z from "zod"

export const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
})

export type LoginSchema = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  phone: z.string().regex(/^\+?[1-9]\d{9,11}$/, {
    message: "Please enter a valid phone number",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
})

export type SignupSchema = z.infer<typeof signupSchema>