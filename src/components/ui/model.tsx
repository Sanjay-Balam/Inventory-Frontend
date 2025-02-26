"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Package, DollarSign, Boxes, Palette, Image } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PrismaAPIRequest } from "@/lib/utils"
interface AddProductDialogProps {
  onProductAdded: () => void
}

export function AddProductDialog({ onProductAdded }: AddProductDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    price: "",
    cost_price: "",
    quantity: "",
    low_stock_threshold: "",
    category_id: "",
    color: "",
    material: "",
    size: "",
    final_selling_price: "",
    description: "",
    variant_1: "",
    variant_2: "",
    image_url: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await PrismaAPIRequest(
        "/inventory/products",
        "POST",
        formData
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add product')
      }

      setOpen(false)
      setFormData({
        name: "",
        sku: "",
        barcode: "",
        price: "",
        cost_price: "",
        quantity: "",
        low_stock_threshold: "",
        category_id: "",
        color: "",
        material: "",
        size: "",
        final_selling_price: "",
        description: "",
        variant_1: "",
        variant_2: "",
        image_url: ""
      })
      onProductAdded()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="bg-white border-b pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">Add New Product</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger 
              value="basic" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
            >
              <Package className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger 
              value="pricing" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
            >
              <DollarSign className="h-4 w-4" />
              Pricing
            </TabsTrigger>
            <TabsTrigger 
              value="inventory" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
            >
              <Boxes className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger 
              value="details" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
            >
              <Palette className="h-4 w-4" />
              Details
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="basic" className="mt-4">
              <Card className="bg-white shadow-sm">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-gray-900">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 bg-white p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-muted-foreground">Product Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter product name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="border-gray-300 focus:ring-blue-500 text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category_id" className="text-muted-foreground">Category *</Label>
                      <Select 
                        name="category_id" 
                        value={formData.category_id}
                        onValueChange={(value) => handleChange({ 
                          target: { name: 'category_id', value } 
                        } as React.ChangeEvent<HTMLInputElement>)}
                      >
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select category" className="text-muted-foreground" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1" className="text-muted-foreground">Category 1</SelectItem>
                          <SelectItem value="2">Category 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sku" className="text-muted-foreground">SKU *</Label>
                      <Input
                        id="sku"
                        name="sku"
                        placeholder="Enter SKU"
                        value={formData.sku}
                        onChange={handleChange}
                        required
                        className="border-gray-300 text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="barcode" className="text-muted-foreground">Barcode *</Label>
                      <Input
                        id="barcode"
                        name="barcode"
                        placeholder="Enter barcode"
                        value={formData.barcode}
                        onChange={handleChange}
                        required
                        className="border-gray-300 text-muted-foreground"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="mt-4">
              <Card className="bg-white shadow-sm">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-gray-900">Pricing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 bg-white p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cost_price" className="text-muted-foreground">Cost Price *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">₹</span>
                        <Input
                          id="cost_price"
                          name="cost_price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.cost_price}
                          onChange={handleChange}
                          required
                          className="pl-8 border-gray-300"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-muted-foreground">Selling Price *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">₹</span>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.price}
                          onChange={handleChange}
                          required
                          className="pl-8 border-gray-300"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="final_selling_price" className="text-muted-foreground">Final Price</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">₹</span>
                        <Input
                          id="final_selling_price"
                          name="final_selling_price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.final_selling_price}
                          onChange={handleChange}
                          className="pl-8 border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory" className="mt-4">
              <Card className="bg-white shadow-sm">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-gray-900">Inventory Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 bg-white p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-muted-foreground">Initial Stock *</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        placeholder="Enter quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="low_stock_threshold" className="text-muted-foreground" >Low Stock Alert *</Label>
                      <Input
                        id="low_stock_threshold"
                        name="low_stock_threshold"
                        type="number"
                        placeholder="Set threshold"
                        value={formData.low_stock_threshold}
                        onChange={handleChange}
                        required
                        className="border-gray-300"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <Card className="bg-white shadow-sm">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-gray-900">Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 bg-white p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="color" className="text-muted-foreground">Color</Label>
                      <Input
                        id="color"
                        name="color"
                        placeholder="Enter color"
                        value={formData.color}
                        onChange={handleChange}
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="material" className="text-muted-foreground">Material</Label>
                      <Input
                        id="material"
                        name="material"
                        placeholder="Enter material"
                        value={formData.material}
                        onChange={handleChange}
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size" className="text-muted-foreground">Size</Label>
                      <Input
                        id="size"
                        name="size"
                        placeholder="Enter size"
                        value={formData.size}
                        onChange={handleChange}
                        className="border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="variant_1" className="text-muted-foreground">Variant 1</Label>
                      <Input
                        id="variant_1"
                        name="variant_1"
                        placeholder="Enter variant"
                        value={formData.variant_1}
                        onChange={handleChange}
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="variant_2" className="text-muted-foreground">Variant 2</Label>
                      <Input
                        id="variant_2"
                        name="variant_2"
                        placeholder="Enter variant"
                        value={formData.variant_2}
                        onChange={handleChange}
                        className="border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-muted-foreground">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter product description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image_url" className="text-muted-foreground">Image URL</Label>
                    <div className="relative">
                      <Input
                        id="image_url"
                        name="image_url"
                        placeholder="Enter image URL"
                        value={formData.image_url}
                        onChange={handleChange}
                        className="pl-10 border-gray-300"
                      />
                      <Image className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {error && (
              <div className="mt-4 p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3 border-t pt-4 bg-gray-50 px-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  'Add Product'
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}