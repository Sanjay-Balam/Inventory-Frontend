"use client"

import { PrismaAPIRequest } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// Removed the import for Avatar and AvatarFallback due to the error
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, SlidersHorizontal } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Package, DollarSign, Boxes, Palette,  } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Image } from "lucide-react"

interface Product {
  product_id: number
  name: string
  sku: string
  quantity: number
  price: string
  cost_price: string
  category: {
    name: string
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false)
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
    final_selling_price: ""
  })

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/inventory/products");
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleProductAdded = () => {
    // Refresh the products list
    fetchProducts()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:3000/api/inventory/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      const data = await response.json();
      handleProductAdded();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Failed to add product');
    }
  }

  // Add this function in your ProductsPage component
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const response = await fetch("http://localhost:3000/api/inventory/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Failed to add product');
        }

        const data = await response.json();
        
        // Download barcode image
        if (data.barcodeUrl) {
            const link = document.createElement('a');
            link.href = data.barcodeUrl;
            link.download = `barcode_${data.sku}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        handleProductAdded();
        setIsModalOpen(false);
    } catch (error) {
        console.error('Error adding product:', error);
        setError('Failed to add product');
    }
};

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold text-muted-foreground">Products & Services</h1>
        <ChevronRight className="w-6 h-6 text-pink-500" />
      </div>

      <div className="border-b mb-6">
        <nav className="flex gap-8">
          <Button variant="link" className="text-blue-600 relative h-10 px-0 font-normal">
            Items
            <span className="ml-1 text-xs bg-neutral-100 px-1.5 py-0.5 rounded">1</span>
          </Button>
          <Button variant="link" className= "h-10 px-0 font-normal text-muted-foreground">
            Categories
          </Button>
          <Button variant="link" className="text-gray-500 h-10 px-0 font-normal">
            Groups
          </Button>
          <Button variant="link" className="text-gray-500 h-10 px-0 font-normal">
            Price Lists
          </Button>
          <Button variant="link" className="text-gray-500 h-10 px-0 font-normal">
            Deleted
          </Button>
        </nav>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Input placeholder="Search products, category, description" className="pl-8" />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {/* <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
            </SelectContent>
          </Select> */}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 text-muted-foreground">
                Actions
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem className="text-muted-foreground">Import</DropdownMenuItem>
              <DropdownMenuItem className="text-muted-foreground">Export</DropdownMenuItem>
              <DropdownMenuItem className="text-muted-foreground">Print</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            + Add Product
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-neutral-50">
              <th className="text-left p-4 font-medium text-gray-500">Item</th>
              <th className="text-left p-4 font-medium text-gray-500">Qty</th>
              <th className="text-left p-4 font-medium text-gray-500">Selling Price (Disc %)</th>
              <th className="text-left p-4 font-medium text-gray-500">Purchase Price</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-4">Loading products...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="text-center p-4 text-red-500">{error}</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4">No products found</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.product_id} className="border-b">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-pink-50">
                        <AvatarFallback className="text-pink-500">
                          {product.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-muted-foreground">{product.name}</div>
                        <div className="text-sm  text-muted-foreground">{product.sku}</div>
                      </div>
                      <Button variant="outline" size="sm" className="ml-2 text-muted-foreground">
                        + Variants
                      </Button>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{product.quantity}</td>
                  <td className="p-4 text-muted-foreground">₹{parseFloat(product.price).toFixed(2)}</td>
                  <td className="p-4 text-muted-foreground">₹{parseFloat(product.cost_price).toFixed(2)}</td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal
          title="Add New Product"
          onClose={() => setIsModalOpen(false)}
          overlayModal={false}
          contentClassName="max-w-5xl"
          alignment="top"
        >
          <div className="flex h-[80vh] overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
              <div className="space-y-1">
                <button
                  onClick={() => document.getElementById('basic-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 text-gray-700 font-medium"
                >
                  <Package className="h-5 w-5 text-blue-600" />
                  <span>Basic Information</span>
                </button>
                <button
                  onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 text-gray-700 font-medium"
                >
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span>Pricing</span>
                </button>
                <button
                  onClick={() => document.getElementById('inventory-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 text-gray-700 font-medium"
                >
                  <Boxes className="h-5 w-5 text-amber-600" />
                  <span>Inventory</span>
                </button>
                <button
                  onClick={() => document.getElementById('details-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 text-gray-700 font-medium"
                >
                  <Palette className="h-5 w-5 text-purple-600" />
                  <span>Details</span>
                </button>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Tips</h3>
                <p className="text-xs text-blue-700">
                  Complete all required fields marked with * for successful product creation. Adding detailed information helps with inventory management and sales tracking.
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleProductSubmit} className="space-y-8">
                {/* Basic Information Section */}
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
                            className="border-gray-300 text-muted-foreground focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category_id" className="text-sm font-medium text-gray-700">
                            Category <span className="text-red-500">*</span>
                          </Label>
                          <Select 
                            name="category_id" 
                            value={formData.category_id}
                            onValueChange={(value) => handleChange({ 
                              target: { name: 'category_id', value } 
                            } as React.ChangeEvent<HTMLInputElement>)}
                          >
                            <SelectTrigger className="border-gray-300 rounded-lg">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Category 1</SelectItem>
                              <SelectItem value="2">Category 2</SelectItem>
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
                            className="border-gray-300 text-muted-foreground focus:border-blue-500 focus:ring-blue-500 rounded-lg"
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
                            className="border-gray-300 text-muted-foreground focus:border-blue-500 focus:ring-blue-500 rounded-lg"
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
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                            <Input
                              id="cost_price"
                              name="cost_price"
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={formData.cost_price}
                              onChange={handleChange}
                              required
                              className="pl-8 border-gray-300 text-muted-foreground focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            />
                          </div>
                          <p className="text-xs text-gray-500">Purchase price from supplier</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                            Selling Price <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                            <Input
                              id="price"
                              name="price"
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={formData.price}
                              onChange={handleChange}
                              required
                              className="pl-8 border-gray-300 text-muted-foreground focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            />
                          </div>
                          <p className="text-xs text-gray-500">Regular selling price</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="final_selling_price" className="text-sm font-medium text-gray-700">
                            Final Price
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                            <Input
                              id="final_selling_price"
                              name="final_selling_price"
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={formData.final_selling_price}
                              onChange={handleChange}
                              className="pl-8 border-gray-300 text-muted-foreground focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            />
                          </div>
                          <p className="text-xs text-gray-500">Price after discounts</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Inventory Section */}
                <section id="inventory-section" className="scroll-mt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Boxes className="h-6 w-6 text-amber-600" />
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
                            className="border-gray-300 text-muted-foreground focus:border-blue-500 focus:ring-blue-500 rounded-lg"
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
                            className="border-gray-300 text-muted-foreground focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          />
                          <p className="text-xs text-gray-500">Get notified when stock falls below this value</p>
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
                          <Label htmlFor="color" className="text-sm font-medium text-gray-700">Color</Label>
                          <Input
                            id="color"
                            name="color"
                            placeholder="Enter color"
                            value={formData.color}
                            onChange={handleChange}
                            className="border-gray-300 text-muted-foreground focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="material" className="text-sm font-medium text-gray-700">Material</Label>
                          <Input
                            id="material"
                            name="material"
                            placeholder="Enter material"
                            value={formData.material}
                            onChange={handleChange}
                            className="border-gray-300 text-muted-foreground focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="size" className="text-sm font-medium text-gray-700">Size</Label>
                          <Input
                            id="size"
                            name="size"
                            placeholder="Enter size"
                            value={formData.size}
                            onChange={handleChange}
                            className="border-gray-300 text-muted-foreground focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="variant_1" className="text-sm font-medium text-gray-700">Variant 1</Label>
                          <Input
                            id="variant_1"
                            name="variant_1"
                            placeholder="Enter variant"
                            value={formData.variant_1}
                            onChange={handleChange}
                            className="border-gray-300 text-muted-foreground focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="variant_2" className="text-sm font-medium text-gray-700">Variant 2</Label>
                          <Input
                            id="variant_2"
                            name="variant_2"
                            placeholder="Enter variant"
                            value={formData.variant_2}
                            onChange={handleChange}
                            className="border-gray-300 text-muted-foreground focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Enter product description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={3}
                          className="border-gray-300 text-muted-foreground focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="image_url" className="text-sm font-medium text-gray-700">Image URL</Label>
                        <div className="relative">
                          <Image className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <Input
                            id="image_url"
                            name="image_url"
                            placeholder="Enter image URL"
                            value={formData.image_url}
                            onChange={handleChange}
                            className="pl-10 border-gray-300 text-muted-foreground focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {error && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                )}

                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 mt-8">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                    className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Adding Product...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        <span>Add Product</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

