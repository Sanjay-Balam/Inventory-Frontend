"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signupSchema, type SignupSchema } from "@/lib/validations/auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      password: "",
    },
  })

  async function onSubmit(data: SignupSchema) {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Signup failed")
      }

      if (result.user) {
        // Signup successful, redirect to login
        router.push("/auth/login")
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An error occurred during signup")
      }
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
      <div className="w-[480px] rounded-[20px] bg-white p-10 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-[32px] font-bold text-[#14171F]">Create Account</h1>
          <p className="text-[16px] text-[#6B7280]">Enter your details to get started</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-[14px] font-medium text-[#14171F]">
              Username
            </label>
            <input
              {...form.register("username")}
              type="text"
              id="username"
              placeholder="Enter your username"
              className="h-[52px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-[16px] text-[#14171F] placeholder:text-[#9CA3AF] focus:border-[#14171F] focus:outline-none focus:ring-1 focus:ring-[#14171F]"
            />
            {form.formState.errors.username && (
              <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-[14px] font-medium text-[#14171F]">
              Email
            </label>
            <input
              {...form.register("email")}
              type="email"
              id="email"
              placeholder="Enter your email"
              className="h-[52px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-[16px] text-[#14171F] placeholder:text-[#9CA3AF] focus:border-[#14171F] focus:outline-none focus:ring-1 focus:ring-[#14171F]"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-[14px] font-medium text-[#14171F]">
              Phone Number
            </label>
            <input
              {...form.register("phone")}
              type="tel"
              id="phone"
              placeholder="Enter your phone number"
              className="h-[52px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-[16px] text-[#14171F] placeholder:text-[#9CA3AF] focus:border-[#14171F] focus:outline-none focus:ring-1 focus:ring-[#14171F]"
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-[14px] font-medium text-[#14171F]">
              Password
            </label>
            <input
              {...form.register("password")}
              type="password"
              id="password"
              placeholder="Enter your password"
              className="h-[52px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-[16px] text-[#14171F] placeholder:text-[#9CA3AF] focus:border-[#14171F] focus:outline-none focus:ring-1 focus:ring-[#14171F]"
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="h-[52px] w-full rounded-[10px] bg-[#14171F] text-[16px] font-medium text-white transition-colors hover:bg-[#14171F]/90 disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-[14px] text-[#6B7280] hover:text-[#14171F]">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  )
}

