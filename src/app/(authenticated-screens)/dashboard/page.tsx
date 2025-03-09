"use client"

import {
    AlertTriangle,
    BarChart3,
    Box,
    DollarSign,
    Package,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Product, productsAtom } from "@/atoms/products"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useProducts } from "@/hooks/useProducts"
import { useAtom } from "jotai"

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("7d")
  const { fetchProducts } = useProducts();
  const [products] = useAtom(productsAtom);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  console.log("products in dashboard", products)

  // Calculate sales data dynamically
  const salesData = products.map((product: Product) => ({
    name: product.name,
    total: parseFloat(product.price) * product.quantity
  }));

  // Update recent orders dynamically if available in products
  const recentOrders = products.map((product: Product) => ({
    id: product.product_id,
    customer: product.name, // Assuming customer name is part of product for example
    amount: parseFloat(product.price),
    status: "Pending", // Placeholder status
    items: product.quantity,
    date: "Just now" // Placeholder date
  }));

  // Update low stock items dynamically
  const lowStockItems = products.filter((product: Product) => product.quantity < product.low_stock_threshold).map((product: Product) => ({
    id: product.product_id,
    name: product.name,
    stock: product.quantity,
    threshold: product.low_stock_threshold,
    status: product.quantity < product.low_stock_threshold / 2 ? "Critical" : "Warning"
  }));

  // Calculate total revenue dynamically
  const totalRevenue = products.reduce((acc, product) => acc + parseFloat(product.price) * product.quantity, 0);

  // Calculate total orders dynamically
  const totalOrders = products.length;

  // Calculate total products dynamically
  const totalProducts = products.length;

  // Calculate low stock alerts dynamically
  const lowStockAlerts = products.filter((product: Product) => product.quantity < product.low_stock_threshold).length;

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
            <div className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</div>
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
            <div className="text-2xl font-bold text-foreground">{totalOrders}</div>
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
            <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
            <p className="text-xs text-foreground">48 added this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{lowStockAlerts}</div>
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
