"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, ChevronDown, Download, Info, Lock, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PrismaAPIRequest } from "@/lib/utils"
import { SellProductModal } from "@/components/SellProductModal"

import { Modal } from "@/components/ui/modal"
import { useForm, Controller } from "react-hook-form"
import { TabSelector } from "@/components/ui/tab-selector"

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

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const itemsPerPage = 10
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isSellModalOpen, setIsSellModalOpen] = useState(false)

  const handleStockUpdate = async (productId: number, action: 'in' | 'out', currentStock: number, channel_id: number) => {
    try {
      const stock = action === 'in' ? currentStock + 1 : currentStock - 1;
      
      const response = await PrismaAPIRequest(
        "/inventory/update",
        "POST",
        {
          product_id: productId,
          channel_id: channel_id,
          stock: stock
        }
      )

      // Handle successful response
      if (response) {
        // Refresh the product list or update the UI
        fetchProducts() // Your function to refresh the products list
      }
    } catch (error) {
      console.error("Failed to update stock:", error)
      // Handle error (maybe show a toast notification)
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

  const fetchProducts = async () => {
    try {
      const response = await PrismaAPIRequest("/inventory/products", "GET");
      console.log("response of products",response)
      setProducts(response || []);
    } catch (error) {
      console.error("Failed to fetch products:", error)
      setProducts([])
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Filter products based on search term
  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.product_id.toString().includes(searchTerm)
  ) || []

  interface SellItemFormData {
    customerName?: string;
    phoneNumber?: string;
    email?: string;
    quantity: number;
    salesChannel: string;
    sellingPrice: string;
    paymentMethod: string;
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
  });

  // Set selling price when product is selected
  useEffect(() => {
    if (selectedProduct) {
      setValue('sellingPrice', selectedProduct.price);
    }
  }, [selectedProduct, setValue]);

  const watchQuantity = watch('quantity');
  const watchSellingPrice = watch('sellingPrice');

  const onSubmit = async (data: SellItemFormData) => {
    
    try {
      console.log("data of sell item:",data)
      
      setShowModal(false);
      reset(); // Reset form
      fetchProducts(); // Refresh product list
    } catch (error) {
      console.error("Failed to process sale:", error);
    }
  };

  // Add state to track customer type
  const [customerType, setCustomerType] = useState("new");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6">

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Inventory</h1>
          <div className="flex gap-2">
            <div onClick={() => setShowModal(true)}>
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
            {filteredProducts.map((product) => (
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

      {showModal && selectedProduct && (
        <Modal
          title="Sell Items"
          onClose={() => {
            setShowModal(false);
            reset();
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
                        control={control}
                        render={({ field }) => (
                          <Input 
                            {...field}
                            placeholder="Enter phone number" 
                            className="text-muted-foreground"
                          />
                        )}
                      />
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
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Selling Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">₹</span>
                  <Controller
                    name="sellingPrice"
                    control={control}
                    rules={{ required: "Selling price is required" }}
                    render={({ field, fieldState }) => (
                      <>
                        <Input 
                          {...field}
                          className="pl-8 text-muted-foreground"
                        />
                        {fieldState.error && (
                          <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-muted-foreground">Payment Details</h2>
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">Payment Method</label>
                <Controller
                  name="paymentMethod"
                  control={control}
                  rules={{ required: "Payment method is required" }}
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="text-muted-foreground">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50">
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-muted-foreground">Total Amount:</span>
                <span className="text-xl font-bold text-muted-foreground">
                  ₹ {((parseFloat(watchSellingPrice) || parseFloat(selectedProduct.price)) * (watchQuantity || 1)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowModal(false);
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

