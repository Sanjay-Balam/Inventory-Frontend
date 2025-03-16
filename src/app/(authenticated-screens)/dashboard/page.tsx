"use client"

import {
    AlertTriangle,
    BarChart3,
    Box,
    CheckCircle,
    Clock,
    DollarSign,
    Package,
    Palette,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

import { Product, productsAtom } from "@/atoms/products"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useProducts } from "@/hooks/useProducts"
import { useAtom } from "jotai"


const dummyAnalysisData = [
  { month: "Jan", income: 12000, expenses: 7000 },
  { month: "Feb", income: 10000, expenses: 6000 },
  { month: "Mar", income: 15000, expenses: 9000 },
  { month: "Apr", income: 13000, expenses: 7000 },
  { month: "May", income: 18000, expenses: 12000 },
  { month: "Jun", income: 14000, expenses: 8000 },
  { month: "Jul", income: 16000, expenses: 10000 },
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


  const recentOrders = products.map((product: Product) => ({
    id: product.product_id,
    customer: product.name,
    amount: parseFloat(product.price),
    status: "Pending",
    items: product.quantity,
    date: "Just now",
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
            <div className="text-2xl font-bold text-foreground">{lowStockAlertsCount}</div>
            <p className="text-xs text-foreground">Alerts</p>
          </CardContent>
        </Card>
      </div>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2 h-[350px] overflow-y-auto">
            {salesData && salesData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Sales
                      </th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contribution
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesData
                      .sort((a, b) => b.total - a.total)
                      .map((item, index) => {
                        const percentage = totalRevenue > 0 ? (item.total / totalRevenue) * 100 : 0
                        return (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {item.name}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              ${item.total.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {percentage.toFixed(1)}%
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No sales data available.</p>
            )}
          </CardContent>
        </Card>
        {/* Recent Orders */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Orders</CardTitle>
            <CardDescription className="text-foreground">
              Latest transactions across all channels
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] overflow-y-scroll scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400">
            <div className="mb-2">
              <Input
                type="text"
                placeholder="Search orders..."
                className="border border-gray-300 rounded mb-2"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              {recentOrders
                .filter((order) => order.customer.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((order) => (
                  <div key={order.id} className="flex items-center p-2 hover:bg-gray-100 rounded">
                    <div className="flex items-center space-x-2">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold leading-none text-foreground">
                          {order.customer}
                        </p>
                        <p className="text-xs text-foreground">
                          Order ID: {order.id} · {order.items} items · ${order.amount}
                        </p>
                        <p className="text-xs text-gray-500">{order.date}</p>
                      </div>
                      <div className="ml-auto flex items-center space-x-1">
                        {order.status === "Completed" && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {order.status === "Processing" && (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        {order.status !== "Completed" &&
                          order.status !== "Processing" && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
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
