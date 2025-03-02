"use client"

import { useEffect, useState } from "react"
import {
  BarChart3,
  Box,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useProducts } from "@/hooks/useProducts"

// Sample data for charts
const salesData = [
  { name: "Jan", total: 1200 },
  { name: "Feb", total: 2100 },
  { name: "Mar", total: 1800 },
  { name: "Apr", total: 2400 },
  { name: "May", total: 2800 },
  { name: "Jun", total: 3200 },
]

// Sample recent orders
const recentOrders = [
  {
    id: "ORD001",
    customer: "John Doe",
    amount: 1234.56,
    status: "Processing",
    items: 3,
    date: "2 hours ago",
  },
  {
    id: "ORD002",
    customer: "Jane Smith",
    amount: 890.0,
    status: "Completed",
    items: 2,
    date: "5 hours ago",
  },
  {
    id: "ORD003",
    customer: "Bob Wilson",
    amount: 432.1,
    status: "Pending",
    items: 1,
    date: "6 hours ago",
  },
]

// Sample low stock items
const lowStockItems = [
  {
    id: "PRD001",
    name: "Premium Headphones",
    stock: 3,
    threshold: 10,
    status: "Critical",
  },
  {
    id: "PRD002",
    name: "Wireless Mouse",
    stock: 8,
    threshold: 15,
    status: "Warning",
  },
  {
    id: "PRD003",
    name: "USB-C Cable",
    stock: 5,
    threshold: 20,
    status: "Critical",
  },
]

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("7d")
  const { products, fetchProducts } = useProducts();
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  console.log("products in dashboard",products)
  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>Download Report</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$45,231.89</div>
            <div className="flex text-xs text-foreground">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500 inline" />
              <p className="text-xs text-foreground">+20.1% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">+573</div>
            <div className="flex text-xs text-foreground">
              <TrendingDown className="mr-1 h-4 w-4 text-red-500 inline" />
              <p className="text-xs text-foreground">-2.5% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Products</CardTitle>
            <Package className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">1,432</div>
            <p className="text-xs text-foreground">48 added this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">12</div>
            <p className="text-xs text-foreground">5 critical items</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={salesData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  style={{ fill: "hsl(var(--foreground))" }}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                  style={{ fill: "hsl(var(--foreground))" }}
                />
                <Tooltip />
                <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Orders</CardTitle>
            <CardDescription className="text-foreground">Latest transactions across all channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">{order.customer}</p>
                    <p className="text-sm text-foreground">
                      {order.items} items · ${order.amount}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    <Badge
                      variant={
                        order.status === "Completed"
                          ? "default"
                          : order.status === "Processing"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Low Stock Alerts</CardTitle>
          <CardDescription>Items that need immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-foreground">
                    Current Stock: {item.stock} / Threshold: {item.threshold}
                  </p>
                </div>
                <Badge variant={item.status === "Critical" ? "destructive" : "warning"}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button className="h-20" variant="outline">
          <div className="flex flex-col items-center justify-center">
            <ShoppingCart className="mb-2 h-5 w-5 text-foreground" />
            <p className="text-foreground">New Order</p>
          </div>
        </Button>
        <Button className="h-20" variant="outline">
          <div className="flex flex-col items-center justify-center">
            <Package className="mb-2 h-5 w-5 text-foreground" />
            <p className="text-foreground">Add Product</p>
          </div>
        </Button>
        <Button className="h-20" variant="outline">
          <div className="flex flex-col items-center justify-center">
            <Box className="mb-2 h-5 w-5 text-foreground" />
            <p className="text-foreground">Stock Update</p>
          </div>
        </Button>
        <Button className="h-20" variant="outline">
          <div className="flex flex-col items-center justify-center">
            <BarChart3 className="mb-2 h-5 w-5 text-foreground" />
            <p className="text-foreground">View Reports</p>
          </div>
        </Button>
      </div>
    </div>
  )
}

