"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Cloud,
  CreditCard,
  FileText,
  Package,
  PenSquare,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Users,
  Wallet,
} from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const menuItems = [
  {
    title: "Sales",
    icon: Wallet,
    items: [
      { title: "Invoices", href: "/sales/invoices" },
      { title: "Credit Notes", href: "/sales/credit-notes" },
      { title: "E-Invoices", href: "/sales/e-invoices" },
      { title: "Subscriptions", href: "/sales/subscriptions" },
    ],
  },
  {
    title: "Purchases",
    icon: ShoppingCart,
    items: [],
  },
  {
    title: "Quotations",
    icon: PenSquare,
    items: [],
  },
  {
    title: "Expenses+",
    icon: CreditCard,
    items: [],
  },
  {
    title: "Products & Services",
    icon: Package,
    href: "/products",
  },
  {
    title: "Inventory",
    icon: Store,
    items: [],
    href: "/dashboard/inventory",
  },
  {
    title: "Payments",
    icon: Wallet,
    items: [],
  },
  {
    title: "Customers",
    icon: Users,
    href: "/customers",
  },
  {
    title: "Vendors",
    icon: Users,
    href: "/vendors",
  },
  {
    title: "Insights",
    icon: BarChart3,
    href: "/insights",
  },
  {
    title: "Reports",
    icon: FileText,
    href: "/reports",
  },
  {
    title: "Packing Lists",
    icon: FileText,
    href: "/packing-lists",
  },
  {
    title: "E-way Bills",
    icon: Truck,
    href: "/e-way-bills",
  },
  {
    title: "OnlineStore",
    icon: ShoppingBag,
    href: "/online-store",
  },
  {
    title: "My Drive",
    icon: Cloud,
    href: "/my-drive",
  },
  {
    title: "Add Users",
    icon: Users,
    href: "/users/add",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [openSections, setOpenSections] = React.useState<string[]>(["Sales"])

  const handleNavigation = (href: string) => {
    if (typeof window !== 'undefined') {
      router.push(href)
    }
  }

  const toggleSection = (title: string) => {
    setOpenSections((prev) => (prev.includes(title) ? prev.filter((section) => section !== title) : [...prev, title]))
  }

  return (
    <div className="w-64 bg-[#F9FAFB] min-h-screen py-4">
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isOpen = openSections.includes(item.title)
          const isActive = pathname.startsWith(item.href || "")

          if (item.items && item.items.length > 0) {
            return (
              <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleSection(item.title)}>
                <CollapsibleTrigger
                  className={`flex w-full items-center justify-between px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-100 ${
                    isActive ? "bg-gray-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-5 w-5 text-gray-500" />
                    <span>{item.title}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-11 space-y-1">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`block px-4 py-2 text-[14px] text-gray-600 hover:bg-gray-100 ${
                          pathname === subItem.href ? "bg-gray-100" : ""
                        }`}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          }

          return (
            <button
              key={item.title}
              onClick={() => handleNavigation(item.href || "#")}
              className={`w-full flex items-center gap-2 px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-100 ${
                isActive ? "bg-gray-100" : ""
              }`}
            >
              <item.icon className="h-5 w-5 text-gray-500" />
              <span>{item.title}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

