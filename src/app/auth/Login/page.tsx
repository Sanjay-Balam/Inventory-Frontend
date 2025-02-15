"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { loginSchema, type LoginSchema } from "@/lib/validations/auth"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginSchema) {
    setIsLoading(true)
    try {
      // Here you would typically make an API call to authenticate
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      router.push("/dashboard")
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
      <div className="w-[480px] rounded-[20px] bg-white p-10 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-[32px] font-bold text-[#14171F]">Welcome Back</h1>
          <p className="text-[16px] text-[#6B7280]">Enter your credentials to continue</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth/signup" className="text-[14px] text-[#6B7280] hover:text-[#14171F]">
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}

