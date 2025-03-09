"use client"

import { useState, useEffect } from "react"
import { atom, useAtom } from "jotai"
import { ArrowLeft, ArrowRight, ChevronDown, Download, Info, Lock, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SellProductModal } from "@/components/SellProductModal"
import { Modal } from "@/components/ui/modal"
import { useForm, Controller } from "react-hook-form"
import { TabSelector } from "@/components/ui/tab-selector"
import { productsAtom, loadingAtom, errorAtom } from "@/atoms/products"

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
  inventory: Array<{
    inventory_id: number
    stock: number
    last_updated: string
  }>
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [barcodeUrl, setBarcodeUrl] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/inventory/products");
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Failed to update stock:", error)
    }
  }

  const handleSellItem = (productId: number) => {
    const product = products.find(p => p.product_id === productId)
    if (product) {
      setSelectedProduct(product)
      setIsSellModalOpen(true)
    }
  }

  const handleCloseSellModal = () => {
    setIsSellModalOpen(false)
    setSelectedProduct(null)
  }

  useEffect(() => {
    setLoading(true)
    // Simulate fetching products
    setTimeout(() => {
      setProducts([
        // ...mock products data...
      ])
      setLoading(false)
    }, 1000)
  }, [setProducts, setLoading])

  // Filter products based on search term
  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_id.toString().includes(searchTerm)
  ) || []

  interface SellItemFormData {
    customerName?: string
    phoneNumber?: string
    email?: string
    quantity: number
    salesChannel: string
    sellingPrice: string
    paymentMethod: string
  }

  const { control, handleSubmit, setValue, watch, reset } = useForm<SellItemFormData>({
    defaultValues: {
      customerName: '',
      phoneNumber: '',
      email: '',
      quantity: 1,
      salesChannel: 'Store',
      sellingPrice: '',
      paymentMethod: 'Cash'
    }
  })

  useEffect(() => {
    if (selectedProduct) {
      setValue('sellingPrice', selectedProduct.price)
    }
  }, [selectedProduct, setValue])

  const watchQuantity = watch('quantity')
  const watchSellingPrice = watch('sellingPrice')

  const onSubmit = async (data: SellItemFormData) => {
    try {
      console.log("data of sell item:", data)
      setIsSellModalOpen(false)
      reset()
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Failed to add product');
    }
  }

  // Add this function in your ProductsPage component
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setBarcodeUrl(null);
    
    try {
        const response = await fetch("http://localhost:3000/api/inventory/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to add product');
        }
        
        // Set success message
        setSuccessMessage(`Product "${data.name}" added successfully!`);
        
        // Handle barcode
        if (data.barcodeUrl) {
            setBarcodeUrl(data.barcodeUrl);
            
            // Show success message with barcode info
            setSuccessMessage(`Product "${data.name}" added successfully! A barcode has been generated.`);
            
            // Optional: Automatically download barcode
            setTimeout(() => {
                try {
                    const link = document.createElement('a');
                    link.href = data.barcodeUrl;
                    link.download = `barcode_${data.sku}_${data.name ? data.name.toLowerCase().replace(/\s+/g, '-') : 'product'}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } catch (downloadError) {
                    console.error('Error downloading barcode:', downloadError);
                    // Don't throw error here, just log it - the product was still created successfully
                }
            }, 1000);
        } else if (data.error && data.error.includes('barcode')) {
            // Product was created but there was a barcode-specific error
            setSuccessMessage(`Product "${data.name}" added successfully, but there was an issue generating the barcode.`);
            console.warn('Barcode generation issue:', data.error);
        }

        // Reset form and refresh product list
        handleProductAdded();
        
        // Close modal after a delay to show success message
        setTimeout(() => {
            setIsModalOpen(false);
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
                final_selling_price: ""
            });
        }, 2000);
    } catch (error) {
        console.error('Error adding product:', error);
        setError(error instanceof Error ? error.message : 'Failed to add product');
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6">

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Inventory</h1>
          <div className="flex gap-2">
            <div onClick={() => setShowModalBulkStockIn(true)}>
              <Button variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-0">
                <Download className="w-4 h-4 mr-2" />
                Bulk Items Stock In
              </Button>
            </div>
            <div>
              <Button variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100 border-0">
                <Download className="w-4 h-4 mr-2" />
                Bulk Items Stock Out
              </Button>
            </div>
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center p-4">Loading products...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center p-4 text-red-500">{error}</TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center p-4">No products found</TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.product_id}>
                  <TableCell className="text-muted-foreground">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.inventory[0]?.stock || product.quantity || 0}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    ₹ {parseFloat(product.cost_price).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    ₹ {parseFloat(product.price).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(product.inventory[0]?.last_updated || product.created_at).toLocaleString('en-US', {
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
                        onClick={() => handleStockUpdate(
                          product.product_id,
                          'in',
                          product.inventory[0]?.stock || product.quantity || 0,
                          product.inventory[0]?.inventory_id || 0
                        )}
                      >
                        Stock In
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 bg-red-50 text-red-700 hover:bg-red-100 border-0"
                        onClick={() => handleStockUpdate(
                          product.product_id,
                          'out',
                          product.inventory[0]?.stock || product.quantity || 0,
                          product.inventory[0]?.inventory_id || 0
                        )}
                      >
                        Stock Out
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 bg-blue-50 text-blue-700 hover:bg-blue-100 border-0"
                        onClick={() => handleSellItem(product.product_id)}
                      >
                        Sell Item
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
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

      {isSellModalOpen && selectedProduct && (
        <Modal
          title="Sell Items"
          onClose={() => {
            setIsSellModalOpen(false)
            reset()
          }}
          overlayModal={false}
          contentClassName="max-w-4xl mt-10 overflow-y-auto max-h-[90vh]"
          alignment="top"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
            {/* Product Information */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-muted-foreground">Product Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium mb-1 text-muted-foreground">Product Name</p>
                  <p className="text-lg text-muted-foreground">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1 text-muted-foreground">SKU</p>
                  <p className="text-lg text-muted-foreground">SKU{selectedProduct.product_id.toString().padStart(3, '0')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1 text-muted-foreground">Available Quantity</p>
                  <p className="text-lg text-muted-foreground">{selectedProduct.inventory[0]?.stock || selectedProduct.quantity || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1 text-muted-foreground">Base Price</p>
                  <p className="text-lg text-muted-foreground">₹ {parseFloat(selectedProduct.price).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-muted-foreground">Customer Information</h2>

              {/* Customer Type Tabs - Using TabSelector component */}
              <TabSelector
                options={[
                  { id: "existing", label: "Existing Customer" },
                  { id: "new", label: "New Customer" }
                ]}
                defaultValue="new"
                value={customerType}
                onChange={(value) => setCustomerType(value)}
                variant="default"
                fullWidth
                className="mb-4"
                activeTabClassName="text-muted-foreground"
                inactiveTabClassName="text-muted-foreground"
              />

              {/* Customer Details Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Customer Name</label>
                  <Controller
                    name="customerName"
                    control={control}
                    rules={{ required: "Customer name is required" }}
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          {...field}
                          placeholder="Enter customer name"
                          className="text-muted-foreground"
                        />
                        {fieldState.error && (
                          <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>

                {/* Only show phone and email fields for new customers */}
                {customerType === "new" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-muted-foreground">Phone Number (Optional)</label>
                      <Controller
                        name="phoneNumber"
                            {...field}
                            placeholder="Enter phone number"
                            className="text-muted-foreground"
                          />
                          <p className="text-xs text-gray-500">Leave empty to auto-generate</p>
                        </div>
                      </div>
                      
                      {/* Barcode Preview Section */}
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-4">
                          <div className="bg-white p-3 rounded-md border border-gray-300 flex items-center justify-center w-48 h-24">
                            {formData.barcode ? (
                              <div className="text-center">
                                <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mb-1">{formData.barcode}</div>
                                <div className="h-8 bg-gray-200 w-32 mx-auto rounded relative overflow-hidden">
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">Barcode Preview</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6M9 11h6M9 15h4" />
                                </svg>
                                <span className="text-xs">Barcode will be generated</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Barcode Information</h4>
                            <p className="text-xs text-gray-600 mb-2">
                              A unique barcode will be generated for this product. The barcode image filename will include:
                            </p>
                            <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                              <li>Product SKU: <span className="font-mono bg-gray-100 px-1 rounded">{formData.sku || 'SKU'}</span></li>
                              <li>Product Name: <span className="font-mono bg-gray-100 px-1 rounded">{formData.name || 'Product Name'}</span></li>
                              <li>Timestamp for uniqueness</li>
                            </ul>
                            <p className="text-xs text-gray-500 mt-2 italic">
                              The barcode can be used for scanning with the inventory app.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-muted-foreground">Email (Optional)</label>
                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Enter email address"
                            className="text-muted-foreground"
                          />
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Details */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-muted-foreground">Order Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Quantity</label>
                  <Controller
                    name="quantity"
                    control={control}
                    rules={{
                      required: "Quantity is required",
                      min: {
                        value: 1,
                        message: "Quantity must be at least 1"
                      },
                      max: {
                        value: selectedProduct.inventory[0]?.stock || selectedProduct.quantity || 0,
                        message: `Maximum available quantity is ${selectedProduct.inventory[0]?.stock || selectedProduct.quantity || 0}`
                      }
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          max={selectedProduct.inventory[0]?.stock || selectedProduct.quantity || 0}
                          className="text-muted-foreground"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                        {fieldState.error && (
                          <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Sales Channel</label>
                  <Controller
                    name="salesChannel"
                    control={control}
                    rules={{ required: "Sales channel is required" }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="text-muted-foreground">
                          <SelectValue placeholder="Select sales channel" />
                        </SelectTrigger>
                        <SelectContent className="bg-white z-50">
                          <SelectItem value="Store">Store</SelectItem>
                          <SelectItem value="Online">Online</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
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
                
                {successMessage && (
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-green-800">{successMessage}</p>
                        {barcodeUrl && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2 mb-1">
                              <img 
                                src={barcodeUrl} 
                                alt="Product Barcode" 
                                className="h-12 border border-green-200 bg-white p-1 rounded"
                              />
                              <div>
                                <p className="text-xs text-green-700">Barcode generated with product name in filename</p>
                                <p className="text-xs text-green-600 mt-1">Downloading automatically...</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsSellModalOpen(false);
                  reset();
                }}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600" onClick={handleSubmit(onSubmit)}>
                Complete Sale
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
