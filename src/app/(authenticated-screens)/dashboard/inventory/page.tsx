"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, ChevronDown, Download, Info, Lock, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Product {
  product_id: number
  name: string
  quantity: number
  cost_price: string
  price: string
  created_at: string
  category: {
    name: string
  }
  // Add other fields as needed
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const itemsPerPage = 10

  // Fetch products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/inventory/products')
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }

    fetchProducts()
  }, [])

  // Filter products based on search term (by name or product_id)
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_id.toString().includes(searchTerm)
  )

  const handleStockUpdate = async (productId: number, action: 'in' | 'out', currentStock: number) => {
    try {
      const stock = action === 'in' ? currentStock + 1 : currentStock - 1;
      
      const response = await fetch('http://localhost:3000/api/inventory/inventory/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          channel_id: 1,
          stock: stock
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to update stock: ${response.status} ${response.statusText}`);
      }

      const updatedProductsResponse = await fetch('http://localhost:3000/api/inventory/products');
      if (!updatedProductsResponse.ok) {
        throw new Error('Failed to fetch updated products');
      }
      
      const updatedProducts = await updatedProductsResponse.json();
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error updating stock:', error);
      // You might want to show this error to the user
      alert('Failed to update stock. Please try again.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6">
        {/* <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Enjoy customizable templates, GST reports, and premium support! ⭐⭐⭐</span>
          </div>
          <Button variant="default" size="sm" className="bg-white text-black hover:bg-gray-100">
            Subscribe Now! 🚀
          </Button>
        </div> */}

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Inventory</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-0">
              <Download className="w-4 h-4 mr-2" />
              Bulk Items Stock In
            </Button>
            <Button variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 border-0">
              <Download className="w-4 h-4 mr-2" />
              Bulk Items Stock Out
            </Button>
            <Button className="bg-blue-600">
              <Lock className="w-4 h-4 mr-2" />
              Manage Warehouses
            </Button>
          </div>
        </div>

        <div className="text-sm">
          <Button variant="link" className="p-0 h-auto text-blue-600">
            Warehouse
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <h3 className="text-lg font-semibold text-muted-foreground">1 Items (0 Qty)</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Positive Stock</p>
                <h3 className="text-lg font-semibold text-muted-foreground">0 Items (0 Qty)</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Value Sales Price</p>
                <h3 className="text-lg font-semibold text-muted-foreground">₹ 0</h3>
              </div>
              <Info className="w-4 h-4 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Value With Purchase Price</p>
                <h3 className="text-lg font-semibold text-muted-foreground">₹ 0</h3>
              </div>
              <Info className="w-4 h-4 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Inventory"
            className="pl-9 text-muted-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Category" className="text-muted-foreground" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="clothing">Clothing</SelectItem>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Actions
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Export</DropdownMenuItem>
            <DropdownMenuItem>Print</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button className="bg-blue-600">
          <Download className="mr-2 h-4 w-4" />
          Download Stock Report
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Purchase Price</TableHead>
              <TableHead>Sale Price</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.product_id}>
                <TableCell className="text-muted-foreground">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{product.quantity}</TableCell>
                <TableCell className="text-muted-foreground">₹ {parseFloat(product.cost_price).toFixed(2)}</TableCell>
                <TableCell className="text-muted-foreground">₹ {parseFloat(product.price).toFixed(2)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(product.created_at).toLocaleString('en-US', { 
                    weekday: 'short',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true 
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 text-muted-foreground">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 bg-green-50 text-green-700 hover:bg-green-100 border-0"
                      onClick={() => handleStockUpdate(product.product_id, 'in', product.quantity)}
                    >
                      Stock In
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 bg-red-50 text-red-700 hover:bg-red-100 border-0"
                      onClick={() => handleStockUpdate(product.product_id, 'out', product.quantity)}
                    >
                      Stock Out
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" disabled={currentPage === 1}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            <div className="bg-blue-600 text-white w-8 h-8 rounded flex items-center justify-center">1</div>
          </div>
          <Button variant="outline" size="icon">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Select value={itemsPerPage.toString()}>
            <SelectTrigger className="w-[70px]">
              <SelectValue className="text-muted-foreground">10</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10" className="text-muted-foreground">10</SelectItem>
              <SelectItem value="20" className="text-muted-foreground">20</SelectItem>
              <SelectItem value="50" className="text-muted-foreground">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Promotional Section */}
      {/* <div className="bg-blue-50 p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Add Multiple Warehouses</h3>
            <p className="text-sm text-gray-600">Get total control of your warehouses & track inventory easily.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="text-gray-600">
              Talk to a specialist
            </Button>
            <Button className="bg-yellow-400 text-black hover:bg-yellow-500">Upgrade ⚡</Button>
          </div>
        </div>
      </div> */}
    </div>
  )
}

