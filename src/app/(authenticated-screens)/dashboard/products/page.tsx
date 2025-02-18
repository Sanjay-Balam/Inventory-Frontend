"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// Removed the import for Avatar and AvatarFallback due to the error
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, SlidersHorizontal } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { AddProductDialog } from "@/components/ui/model"

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

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/inventory/products')
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
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Actions
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Import</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
              <DropdownMenuItem>Print</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AddProductDialog onProductAdded={handleProductAdded} />
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
    </div>
  )
}

