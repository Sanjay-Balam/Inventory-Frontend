"use client"

import type React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuthCheck } from "@/hooks/auth-check"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useAuthCheck()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-white p-6">{children}</main>
    </div>
  )
}

