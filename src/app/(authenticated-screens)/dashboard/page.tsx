"use client"

import {
    AlertTriangle,
    ArrowUpRight,
    BarChart3,
    Box,
    CheckCircle,
    DollarSign,
    Package,
    Palette,
    Search,
    ShoppingCart,
    TrendingDown,
    TrendingUp
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts"

import { Product, productsAtom } from "@/atoms/products"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useProducts } from "@/hooks/useProducts"
import { useAtom } from "jotai"

interface Order {
  id: number
  product: string
  sku: string
  items: number
  total: number
  status: string
  date: string
}

const dummyAnalysisData = [
  { month: "Jan", income: 12000, expenses: 7000 },
  { month: "Feb", income: 10000, expenses: 6000 },
  { month: "Mar", income: 15000, expenses: 9000 },
  { month: "Apr", income: 13000, expenses: 7000 },
  { month: "May", income: 18000, expenses: 12000 },
  { month: "Jun", income: 14000, expenses: 8000 },
  { month: "Jul", income: 16000, expenses: 10000 },
]

const topProducts = [
  { name: "Premium Laptop", sales: 124, revenue: 186000, growth: 12.5 },
  { name: "Wireless Earbuds", sales: 89, revenue: 13350, growth: 8.2 },
  { name: "Smart Watch", sales: 65, revenue: 19500, growth: -2.4 },
  { name: "Bluetooth Speaker", sales: 54, revenue: 8100, growth: 5.7 },
]

const recentOrders: Order[] = [
  {
    id: 38,
    product: "Test Product",
    sku: "591253080970",
    items: 100,
    total: 99.99,
    status: "pending",
    date: "2023-03-14",
  },
  {
    id: 39,
    product: "Premium Laptop",
    sku: "591253080971",
    items: 1,
    total: 1299.99,
    status: "pending",
    date: "2023-03-14",
  },
  {
    id: 37,
    product: "Wireless Earbuds",
    sku: "591253080969",
    items: 2,
    total: 299.98,
    status: "shipped",
    date: "2023-03-13",
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const { fetchProducts } = useProducts()
  const [products] = useAtom(productsAtom)
  const [searchTerm, setSearchTerm] = useState("")


  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [isAnalysisReportOpen, setIsAnalysisReportOpen] = useState(false)


  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    sku: "",
    barcode: "",
    cost_price: "",
    price: "",
    quantity: "",
    low_stock_threshold: "",
    color: "",
    material: "",
    size: "",
    variant_1: "",
    variant_2: "",
    description: "",
    image_url: "",
    final_selling_price: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)


  const [analysisData, setAnalysisData] = useState<any[]>([])
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)


  const [orderSearchTerm, setOrderSearchTerm] = useState("")
  const [showAllOrders, setShowAllOrders] = useState(false)
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  const [orderStatusDropdownOpen, setOrderStatusDropdownOpen] = useState(false)
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false)

  // Filter orders based on search term and filters
  const filteredOrders = useMemo(() => {
    let filtered: Order[] = [...recentOrders] // Create a copy of the array to avoid mutations

    // Search filter
    if (orderSearchTerm) {
      filtered = filtered.filter(
        (order: Order) =>
          order.product.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
          order.sku.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
          order.id.toString().includes(orderSearchTerm)
      )
    }

    // Status filter - only apply if not "all"
    if (orderStatusFilter && orderStatusFilter !== "all") {
      filtered = filtered.filter((order: Order) => order.status === orderStatusFilter)
    }

    // Date filter - only apply if not "all"
    if (dateFilter && dateFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // Start of today

      switch (dateFilter) {
        case "today":
          filtered = filtered.filter((order: Order) => {
            const orderDate = new Date(order.date)
            return orderDate >= today
          })
          break
        case "week":
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          filtered = filtered.filter((order: Order) => new Date(order.date) >= weekAgo)
          break
        case "month":
          const monthAgo = new Date(today)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          filtered = filtered.filter((order: Order) => new Date(order.date) >= monthAgo)
          break
      }
    }

    return filtered
  }, [recentOrders, orderSearchTerm, orderStatusFilter, dateFilter])

  // Handle view all orders
  const handleViewAllOrders = () => {
    setShowAllOrders(true)
  }


  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])


  useEffect(() => {
    if (isAnalysisReportOpen) {
      setAnalysisLoading(true)
      setAnalysisError(null)

      setTimeout(() => {
        setAnalysisData(dummyAnalysisData)
        setAnalysisLoading(false)
      }, 500)
    }
  }, [isAnalysisReportOpen])


  const salesData = products.map((product: Product) => ({
    name: product.name,
    total: parseFloat(product.price) * product.quantity,
  }))


  function getLowStockAlerts(products: Product[]) {
    return products
      .filter((product) => product.quantity < product.low_stock_threshold)
      .map((product) => ({
        id: product.product_id,
        name: product.name,
        stock: product.quantity,
        threshold: product.low_stock_threshold,
        status: product.quantity < product.low_stock_threshold / 2 ? "Critical" : "Warning",
      }))
  }
  const lowStockItems = getLowStockAlerts(products)


  const totalRevenue = products.reduce(
    (acc, product) => acc + parseFloat(product.price) * product.quantity,
    0
  )
  const totalOrders = products.length
  const totalProducts = products.length
  const lowStockAlertsCount = lowStockItems.length


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }


  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)


    const requiredFields = ["name", "category_id", "sku", "price", "cost_price", "quantity", "low_stock_threshold"]
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData])
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(", ")}`)
      setLoading(false)
      return
    }


    const numericFields = ["price", "cost_price", "quantity", "low_stock_threshold"]
    for (const field of numericFields) {
      const value = formData[field as keyof typeof formData]
      if (value && isNaN(Number(value))) {
        setError(`${field} must be a valid number`)
        setLoading(false)
        return
      }
    }


    try {
      const response = await fetch("http://localhost:3000/api/inventory/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to add product")
      }
      setSuccessMessage(`Product "${data.name}" added successfully!`)

      fetchProducts()

      setTimeout(() => {
        setIsAddProductModalOpen(false)
        setFormData({
          name: "",
          category_id: "",
          sku: "",
          barcode: "",
          cost_price: "",
          price: "",
          quantity: "",
          low_stock_threshold: "",
          color: "",
          material: "",
          size: "",
          variant_1: "",
          variant_2: "",
          description: "",
          image_url: "",
          final_selling_price: "",
        })
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, John</h2>
        <p className="text-muted-foreground">Here's what's happening with your inventory today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              <p className="text-green-500">+20.1% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="flex items-center text-xs">
              <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
              <p className="text-red-500">-2.5% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">+48 added this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockAlertsCount}</div>
            <p className="text-xs text-muted-foreground">All products in stock</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales Overview */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales performance</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dummyAnalysisData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="income" stroke="#34D399" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue vs Expenses */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Comparison over the last year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dummyAnalysisData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="income" stroke="#34D399" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#F87171" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Products with the highest sales volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{product.name}</p>
                      <p className="font-medium">${product.revenue.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <p>{product.sales} units sold</p>
                      <div
                        className={`flex items-center ${
                          product.growth >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        <ArrowUpRight
                          className={`h-3 w-3 mr-1 ${product.growth < 0 ? "rotate-180" : ""}`}
                        />
                        {Math.abs(product.growth)}%
                      </div>
                    </div>
                    <div className="w-full bg-muted/50 h-1">
                      <div
                        className="bg-primary h-1"
                        style={{ width: `${75 - i * 15}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Card */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest transactions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" onClick={handleViewAllOrders}>
              <span>View All</span>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    className="pl-8"
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={orderStatusFilter}
                    onValueChange={setOrderStatusFilter}
                    onOpenChange={setOrderStatusDropdownOpen}
                  >
                    <SelectTrigger className="w-[130px] truncate">
                      <SelectValue>
                        {orderStatusFilter === "all" ? "Status" : orderStatusFilter}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={dateFilter}
                    onValueChange={setDateFilter}
                    onOpenChange={setDateDropdownOpen}
                  >
                    <SelectTrigger className="w-[130px] truncate">
                      <SelectValue>
                        {dateFilter === "all" ? "Date" : dateFilter === "week" ? "Last 7 Days" :
                         dateFilter === "month" ? "Last 30 Days" : "Today"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Orders List */}
              <ScrollArea className={`h-[350px] transition-all duration-200 ${
                (orderStatusDropdownOpen || dateDropdownOpen)
                  ? 'blur-sm pointer-events-none'
                  : ''
              }`}>
                <div className="space-y-4">
                  {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Package className="h-12 w-12 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No orders found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-col space-y-2 rounded-lg border p-3 shadow-sm transition-all hover:bg-accent/50 cursor-pointer"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{order.product}</span>
                              <Badge
                                variant={
                                  order.status === "delivered"
                                    ? "default"
                                    : order.status === "shipped"
                                    ? "secondary"
                                    : "outline"
                                }
                                className="capitalize"
                              >
                                {order.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Order #{order.id} - {order.items} {order.items === 1 ? "item" : "items"} - ${order.total}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>SKU: {order.sku}</span>
                          <span>{new Date(order.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Showing {filteredOrders.length} orders</span>
                  <span>
                    Total Value: ${filteredOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View All Orders Modal */}
      {showAllOrders && (
        <Modal
          title="All Orders"
          onClose={() => setShowAllOrders(false)}
          overlayModal={false}
          contentClassName="max-w-4xl"
          alignment="top"
        >
          <div className="p-6">
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    className="pl-8"
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={orderStatusFilter}
                    onValueChange={setOrderStatusFilter}
                  >
                    <SelectTrigger className="w-[130px] truncate">
                      <SelectValue>
                        {orderStatusFilter === "all" ? "Status" : orderStatusFilter}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={dateFilter}
                    onValueChange={setDateFilter}
                  >
                    <SelectTrigger className="w-[130px] truncate">
                      <SelectValue>
                        {dateFilter === "all" ? "Date" : dateFilter === "week" ? "Last 7 Days" :
                         dateFilter === "month" ? "Last 30 Days" : "Today"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="rounded-md border">
                <ScrollArea className="h-[500px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left text-sm font-medium">Order ID</th>
                        <th className="h-10 px-4 text-left text-sm font-medium">Product</th>
                        <th className="h-10 px-4 text-left text-sm font-medium">Status</th>
                        <th className="h-10 px-4 text-left text-sm font-medium">Items</th>
                        <th className="h-10 px-4 text-left text-sm font-medium">Total</th>
                        <th className="h-10 px-4 text-left text-sm font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                          onClick={() => router.push(`/orders/${order.id}`)}
                        >
                          <td className="p-4 text-sm">#{order.id}</td>
                          <td className="p-4 text-sm">{order.product}</td>
                          <td className="p-4 text-sm">
                            <Badge
                              variant={
                                order.status === "delivered"
                                  ? "default"
                                  : order.status === "shipped"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="capitalize"
                            >
                              {order.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm">{order.items}</td>
                          <td className="p-4 text-sm">${order.total}</td>
                          <td className="p-4 text-sm">{new Date(order.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>

              {/* Summary Footer */}
              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredOrders.length} orders
                </div>
                <div className="text-sm font-medium">
                  Total Value: ${filteredOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Low Stock Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Low Stock Alerts</CardTitle>
          <CardDescription>Items that need immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          {lowStockItems.length === 0 ? (
            <div className="flex items-center justify-center p-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span className="ml-2 text-sm text-green-500">
                All products are well stocked.
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded border border-gray-200"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Stock: {item.stock} / Threshold: {item.threshold}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {item.status === "Critical" && (
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    {item.status === "Warning" && (
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    )}
                    <Badge variant={item.status === "Critical" ? "destructive" : "warning"}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button className="h-20" variant="outline" onClick={() => router.push("/orders/new")}>
          <div className="flex flex-col items-center justify-center">
            <ShoppingCart className="mb-2 h-5 w-5 text-foreground" />
            <p className="text-foreground">New Order</p>
          </div>
        </Button>
        <Button className="h-20" variant="outline" onClick={() => setIsAddProductModalOpen(true)}>
          <div className="flex flex-col items-center justify-center">
            <Package className="mb-2 h-5 w-5 text-foreground" />
            <p className="text-foreground">Add Product</p>
          </div>
        </Button>
        <Button className="h-20" variant="outline" onClick={() => router.push("/stock")}>
          <div className="flex flex-col items-center justify-center">
            <Box className="mb-2 h-5 w-5 text-foreground" />
            <p className="text-foreground">Stock Update</p>
          </div>
        </Button>
        <Button className="h-20" variant="outline" onClick={() => setIsAnalysisReportOpen(true)}>
          <div className="flex flex-col items-center justify-center">
            <BarChart3 className="mb-2 h-5 w-5 text-foreground" />
            <p className="text-foreground">View Reports</p>
          </div>
        </Button>
      </div>

      {/* Add Product Modal */}
      {isAddProductModalOpen && (
        <Modal
          title="Add New Product"
          onClose={() => setIsAddProductModalOpen(false)}
          overlayModal={false}
          contentClassName="max-w-5xl"
          alignment="top"
        >
          <div className="flex h-[80vh] overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
              <div className="space-y-1">
                <button
                  onClick={() =>
                    document.getElementById("basic-section")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-100 transition-colors"
                >
                  <Package className="h-5 w-5 text-blue-600" />
                  <span>Basic Information</span>
                </button>
                <button
                  onClick={() =>
                    document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-100 transition-colors"
                >
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span>Pricing</span>
                </button>
                <button
                  onClick={() =>
                    document.getElementById("inventory-section")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-100 transition-colors"
                >
                  <Box className="h-5 w-5 text-amber-600" />
                  <span>Inventory</span>
                </button>
                <button
                  onClick={() =>
                    document.getElementById("details-section")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-100 transition-colors"
                >
                  <Palette className="h-5 w-5 text-purple-600" />
                  <span>Details</span>
                </button>
              </div>
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Tips</h3>
                <p className="text-xs text-blue-700">
                  Complete all required fields marked with * for successful product creation.
                  Adding detailed information helps with inventory management and sales tracking.
                </p>
              </div>
            </div>

            {/* Main Form Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleAddProductSubmit} className="space-y-8">
                {/* Basic Information */}
                <section id="basic-section" className="scroll-mt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                            Product Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Enter product name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="border-gray-300 focus:border-blue-500 rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category_id" className="text-sm font-medium text-gray-700">
                            Category <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            name="category_id"
                            value={formData.category_id}
                            onValueChange={(value) =>
                              handleChange({
                                target: { name: "category_id", value, type: "text" },
                              } as React.ChangeEvent<HTMLInputElement>)
                            }
                          >
                            <SelectTrigger className="border-gray-300 rounded-lg">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Category One</SelectItem>
                              <SelectItem value="2">Category Two</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sku" className="text-sm font-medium text-gray-700">
                            SKU <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="sku"
                            name="sku"
                            placeholder="Enter SKU"
                            value={formData.sku}
                            onChange={handleChange}
                            required
                            className="border-gray-300 focus:border-blue-500 rounded-lg"
                          />
                          <p className="text-xs text-gray-500">Unique identifier for your product</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="barcode" className="text-sm font-medium text-gray-700">
                            Barcode
                          </Label>
                          <Input
                            id="barcode"
                            name="barcode"
                            placeholder="Enter barcode (optional)"
                            value={formData.barcode}
                            onChange={handleChange}
                            className="border-gray-300 focus:border-blue-500 rounded-lg"
                          />
                          <p className="text-xs text-gray-500">Leave empty to auto-generate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing-section" className="scroll-mt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Pricing Information</h2>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="cost_price" className="text-sm font-medium text-gray-700">
                            Cost Price <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="cost_price"
                            name="cost_price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.cost_price}
                            onChange={handleChange}
                            required
                            className="border-gray-300 focus:border-blue-500 rounded-lg"
                          />
                          <p className="text-xs text-gray-500">Purchase price from supplier</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                            Selling Price <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            className="border-gray-300 focus:border-blue-500 rounded-lg"
                          />
                          <p className="text-xs text-gray-500">Regular selling price</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="final_selling_price" className="text-sm font-medium text-gray-700">
                            Final Price
                          </Label>
                          <Input
                            id="final_selling_price"
                            name="final_selling_price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.final_selling_price}
                            onChange={handleChange}
                            className="border-gray-300 focus:border-blue-500 rounded-lg"
                          />
                          <p className="text-xs text-gray-500">Price after discounts</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Inventory Section */}
                <section id="inventory-section" className="scroll-mt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Box className="h-6 w-6 text-amber-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Inventory Management</h2>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                            Initial Stock <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="quantity"
                            name="quantity"
                            type="number"
                            placeholder="Enter quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                            className="border-gray-300 focus:border-blue-500 rounded-lg"
                          />
                          <p className="text-xs text-gray-500">Current available quantity</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="low_stock_threshold" className="text-sm font-medium text-gray-700">
                            Low Stock Alert <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="low_stock_threshold"
                            name="low_stock_threshold"
                            type="number"
                            placeholder="Set threshold"
                            value={formData.low_stock_threshold}
                            onChange={handleChange}
                            required
                            className="border-gray-300 focus:border-blue-500 rounded-lg"
                          />
                          <p className="text-xs text-gray-500">
                            Get notified when stock falls below this value
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Details Section */}
                <section id="details-section" className="scroll-mt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Palette className="h-6 w-6 text-purple-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Product Details</h2>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="color" className="text-sm font-medium text-gray-700">
                            Color
                          </Label>
                          <Input
                            id="color"
                            name="color"
                            placeholder="Enter color"
                            value={formData.color}
                            onChange={handleChange}
                            className="border-gray-300 focus:border-blue-500 rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="material" className="text-sm font-medium text-gray-700">
                            Material
                          </Label>
                          <Input
                            id="material"
                            name="material"
                            placeholder="Enter material"
                            value={formData.material}
                            onChange={handleChange}
                            className="border-gray-300 focus:border-blue-500 rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="size" className="text-sm font-medium text-gray-700">
                            Size
                          </Label>
                          <Input
                            id="size"
                            name="size"
                            placeholder="Enter size"
                            value={formData.size}
                            onChange={handleChange}
                            className="border-gray-300 focus:border-blue-500 rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="variant_1" className="text-sm font-medium text-gray-700">
                            Variant 1
                          </Label>
                          <Input
                            id="variant_1"
                            name="variant_1"
                            placeholder="Enter variant"
                            value={formData.variant_1}
                            onChange={handleChange}
                            className="border-gray-300 focus:border-blue-500 rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="variant_2" className="text-sm font-medium text-gray-700">
                            Variant 2
                          </Label>
                          <Input
                            id="variant_2"
                            name="variant_2"
                            placeholder="Enter variant"
                            value={formData.variant_2}
                            onChange={handleChange}
                            className="border-gray-300 focus:border-blue-500 rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Enter product description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={3}
                          className="border-gray-300 focus:border-blue-500 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image_url" className="text-sm font-medium text-gray-700">
                          Image URL
                        </Label>
                        <Input
                          id="image_url"
                          name="image_url"
                          placeholder="Enter image URL"
                          value={formData.image_url}
                          onChange={handleChange}
                          className="border-gray-300 focus:border-blue-500 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
                {successMessage && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-800">{successMessage}</p>
                  </div>
                )}

                <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3 mt-8">
                  <Button type="button" variant="outline" onClick={() => setIsAddProductModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Adding Product..." : "Add Product"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}


      {isAnalysisReportOpen && (
        <Modal
          title="View Reports"
          onClose={() => setIsAnalysisReportOpen(false)}
          overlayModal={false}
          contentClassName="max-w-3xl"
          alignment="top"
        >
          <div className="p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                This report compares monthly <strong>Income</strong> vs. <strong>Expenses</strong>.
              </p>
            </div>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analysisData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="#4B5563" />
                  <YAxis stroke="#4B5563" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#34D399" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="expenses" stroke="#F87171" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setIsAnalysisReportOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
