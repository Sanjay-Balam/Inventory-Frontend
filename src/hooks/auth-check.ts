import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useAuthCheck() {
  const router = useRouter()

  useEffect(() => {
    const authToken = localStorage.getItem("authToken")
    
    if (!authToken) {
      router.push("/auth/login")
    }
  }, [router])
}
