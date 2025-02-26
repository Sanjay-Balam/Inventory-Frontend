import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

interface APIRequestOptions {
  method: HttpMethod
  data?: Record<string, any>
  headers?: Record<string, string>
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
export async function baseFetch(endpoint: string, options: APIRequestOptions) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: options.method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
    body: options.data ? JSON.stringify(options.data) : undefined,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }

  return response.json()
}

export async function PrismaAPIRequest(
  endpoint: string,
  method: HttpMethod,
  data?: Record<string, any>
) {
  // Get auth token from localStorage or wherever you store it
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

  if (!token && endpoint !== "/auth/login" && endpoint !== "/auth/signup") {
    throw new Error("Authentication required")
  }

  const headers: Record<string, string> = {}
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    return await baseFetch(endpoint, {
      method,
      data,
      headers,
    })
  } catch (error) {
    if (error instanceof Error) {
      // Handle token expiration or authentication errors
      if (error.message.includes("401")) {
        localStorage.removeItem("authToken");
      }
      throw error
    }
    throw new Error("An unknown error occurred")
  }
}


/*
  use the following code to make requests to the API
// GET request
const getData = async () => {
  const response = await PrismaAPIRequest("/users", "GET")
  return response
}

// POST request with data
const createUser = async (userData: any) => {
  const response = await PrismaAPIRequest("/users", "POST", userData)
  return response
}

// PUT request with data
const updateUser = async (userId: string, userData: any) => {
  const response = await PrismaAPIRequest(`/users/${userId}`, "PUT", userData)
  return response
}

// DELETE request
const deleteUser = async (userId: string) => {
  const response = await PrismaAPIRequest(`/users/${userId}`, "DELETE")
  return response
}
 */