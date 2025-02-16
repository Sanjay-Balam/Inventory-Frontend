import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useAuthCheck() {
  const router = useRouter()

  useEffect(() => {
    const authToken = localStorage.getItem("authToken")
    const refreshToken = localStorage.getItem("refreshToken")
    if (!authToken || !refreshToken) {
      router.push("/auth/login")
    }
  }, [router])
}
