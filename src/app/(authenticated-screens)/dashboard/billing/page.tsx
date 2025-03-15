"use client"

import type React from "react"
import { useAtom } from "jotai"
import { useState, useRef, useEffect } from "react"
import { Trash2, Plus, Minus, Printer, User, ShoppingBag, BarChart4 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TabSelector } from "@/components/ui/tab-selector"
import { productsAtom } from "@/atoms/products"
import { useDebounce } from "@/hooks/useDebounce"
import { Modal } from "@/components/ui/modal"
import { CloseIcon } from "@/lib/icons"
import { useCustomerDetails } from "@/hooks/useCustomerdetails"
interface BillItem {
  id: number
  barcode: string
  name: string
  price: number
  mrp: number
  cost: number
  quantity: number
  subtotal: number
}

interface Customer {
  customer_id: number
  name: string
  phone: string
  email: string | null
  address: string | null
}

export default function BillingPage() {
  const [barcodeInput, setBarcodeInput] = useState("")
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [customer, setCustomer] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearchResults, setCustomerSearchResults] = useState<Customer[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [newCustomerData, setNewCustomerData] = useState({ name: "", phone: "", email: "", address: "" })
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(18) // Default GST rate
  const [isProcessing, setIsProcessing] = useState(false)
  const [isBillComplete, setIsBillComplete] = useState(false)
  const barcodeInputRef = useRef<HTMLInputElement>(null)
  const [products, setProducts] = useAtom(productsAtom)
  const { customers, isLoading, error } = useCustomerDetails();
  const debouncedCustomerSearch = useDebounce(customer, 300)

  // Focus on barcode input when page loads
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus()
    }
  }, [])
  console.log("Products from the billing page",products);
  console.log("Customers from the billing page",customers);
  // Calculate totals
  const subtotal = billItems.reduce((sum, item) => sum + item.subtotal, 0)
  const discountAmount = (subtotal * discount) / 100
  const taxAmount = ((subtotal - discountAmount) * tax) / 100
  const total = subtotal - discountAmount + taxAmount

  // Update the useEffect for customer search
  useEffect(() => {
    if (debouncedCustomerSearch.trim().length > 2) {
      // Search from local customers array
      const localResults = customers.filter(c => 
        c.name.toLowerCase().includes(debouncedCustomerSearch.toLowerCase()) ||
        c.phone.includes(debouncedCustomerSearch) ||
        (c.email && c.email.toLowerCase().includes(debouncedCustomerSearch.toLowerCase()))
      );
      
      setCustomerSearchResults(localResults);
    } else {
      setCustomerSearchResults([]);
    }
  }, [debouncedCustomerSearch, customers]);
  
  // Add this function to handle customer selection
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomer(customer.name); // Update the input field
    setCustomerSearchResults([]); // Clear search results
  };
  
  // Add this function to handle adding a new customer
  const handleAddCustomer = async () => {
    if (!newCustomerData.name || !newCustomerData.phone) {
      alert("Name and phone are required");
      return;
    }
    
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCustomerData),
      });
      
      if (response.ok) {
        const customer = await response.json();
        setSelectedCustomer(customer);
        setCustomer(customer.name);
        setShowCustomerModal(false);
        setNewCustomerData({ name: "", phone: "", email: "", address: "" });
      }
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!barcodeInput.trim()) return

    // Find product by barcode
    const product = products.find((p) => p.barcode === barcodeInput)

    if (product) {
      // Check if product already exists in bill
      const existingItemIndex = billItems.findIndex((item) => item.barcode === barcodeInput)

      if (existingItemIndex >= 0) {
        // Update quantity if product already in bill
        const updatedItems = [...billItems]
        updatedItems[existingItemIndex].quantity += 1
        updatedItems[existingItemIndex].subtotal =
          updatedItems[existingItemIndex].price * updatedItems[existingItemIndex].quantity
        setBillItems(updatedItems)
      } else {
        // Add new product to bill
        const price = parseFloat(product.price)
        const mrp = product.final_selling_price ? parseFloat(product.final_selling_price) : price
        const cost = parseFloat(product.cost_price)
        
        setBillItems([
          ...billItems,
          {
            id: product.product_id,
            barcode: product.barcode,
            name: product.name,
            price: price,
            mrp: mrp,
            cost: cost,
            quantity: 1,
            subtotal: price,
          },
        ])
      }

      // Clear input and focus for next scan
      setBarcodeInput("")
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus()
      }
    } else {
      alert("Product not found!")
    }
  }

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return

    const updatedItems = [...billItems]
    updatedItems[index].quantity = newQuantity
    updatedItems[index].subtotal = updatedItems[index].price * newQuantity
    setBillItems(updatedItems)
  }

  const handleRemoveItem = (index: number) => {
    setBillItems(billItems.filter((_, i) => i !== index))
  }

  const handleCompleteSale = () => {
    if (billItems.length === 0) {
      alert("Please add items to the bill")
      return
    }

    setIsProcessing(true)

    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false)
      setIsBillComplete(true)
      // In a real app, you would save the order to the database here
    }, 1500)
  }

  const handleNewBill = () => {
    setBillItems([])
    setCustomer("")
    setDiscount(0)
    setIsBillComplete(false)
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus()
    }
  }

  const paymentOptions = [
    { id: "cash", label: "Cash" },
    { id: "card", label: "Card" },
    { id: "upi", label: "UPI" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-foreground text-background" onClick={handleNewBill}>
            New Bill
          </Button>
          <Button variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-0">
            <Printer className="w-4 h-4 mr-2" />
            Print Last Bill
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Left Column - Billing Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground">Scan Products</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <ShoppingBag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    ref={barcodeInputRef}
                    placeholder="Scan barcode or enter product code"
                    className="pl-9 text-foreground"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    disabled={isBillComplete}
                  />
                </div>
                <Button type="submit" disabled={isBillComplete}>
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">Bill Items</CardTitle>
              <div className="text-sm text-muted-foreground">
                Total Items: {billItems.length} | Total Qty: {billItems.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-blue-50">
                    <TableRow>
                      <TableHead className="w-12 text-center font-medium">S.No</TableHead>
                      <TableHead className="w-28 font-medium">Barcode</TableHead>
                      <TableHead className="font-medium">Product</TableHead>
                      <TableHead className="text-right font-medium">MRP</TableHead>
                      <TableHead className="text-right font-medium">Basic Cost</TableHead>
                      <TableHead className="text-right font-medium">Selling Price</TableHead>
                      <TableHead className="text-center w-28 font-medium">Quantity</TableHead>
                      <TableHead className="text-right font-medium">Subtotal</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center">
                            <BarChart4 className="h-8 w-8 mb-2 text-muted-foreground/50" />
                            <span>No items added to bill yet</span>
                            <span className="text-sm text-muted-foreground/70 mt-1">
                              Scan a barcode or enter product code above
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      billItems.map((item, index) => (
                        <TableRow key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <TableCell className="text-center font-medium text-gray-700">{index + 1}</TableCell>
                          <TableCell className="font-mono text-gray-700">{item.barcode}</TableCell>
                          <TableCell className="font-medium text-gray-800">{item.name}</TableCell>
                          <TableCell className="text-right text-gray-700">₹ {item.mrp.toFixed(2)}</TableCell>
                          <TableCell className="text-right text-gray-700">₹ {item.cost.toFixed(2)}</TableCell>
                          <TableCell className="text-right text-gray-700">₹ {item.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 border-gray-300"
                                onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                disabled={isBillComplete}
                              >
                                <Minus className="h-3 w-3 text-foreground" />
                              </Button>
                              <span className="w-8 text-center font-medium text-gray-800">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 border-gray-300"
                                onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                disabled={isBillComplete}
                              >
                                <Plus className="h-3 w-3 text-foreground" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium text-gray-800">₹ {item.subtotal.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:bg-red-50"
                              onClick={() => handleRemoveItem(index)}
                              disabled={isBillComplete}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {billItems.length > 0 && (
                <div className="mt-4 bg-gray-50 rounded-md p-4">
                  <div className="flex flex-col gap-2 ml-auto w-full max-w-xs">
                    <div className="flex justify-between items-center text-gray-700">
                      <span className="font-medium">Subtotal:</span>
                      <span className="font-medium">₹ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span className="font-medium">Discount ({discount}%):</span>
                      <span className="font-medium">₹ {discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-700">
                      <span className="font-medium">Tax ({tax}%):</span>
                      <span className="font-medium">₹ {taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-gray-200 my-1"></div>
                    <div className="flex justify-between items-center text-gray-900">
                      <span className="font-bold text-lg">Total:</span>
                      <span className="font-bold text-lg">₹ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {billItems.length > 0 && !isBillComplete && (
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="outline" 
                    className="bg-red-50 text-red-600 hover:bg-red-100 border-0 mr-2"
                    onClick={() => setBillItems([])}
                  >
                    Clear All
                  </Button>
                  <Button 
                    className="bg-blue-600"
                    onClick={() => {
                      if (barcodeInputRef.current) {
                        barcodeInputRef.current.focus()
                      }
                    }}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="flex gap-6">
          <div className="flex-1">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground">Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search customer or enter details"
                      className="pl-9 text-foreground"
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
                      disabled={isBillComplete}
                    />
                    
                    {/* Customer search results dropdown */}
                    {customerSearchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                        {customerSearchResults.map((customer) => (
                          <div
                            key={customer.customer_id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSelectCustomer(customer)}
                          >
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-600">{customer.phone}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {selectedCustomer && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <div className="font-medium text-foreground">{selectedCustomer.name}</div>
                      <div className="text-sm text-gray-600">{selectedCustomer.phone}</div>
                      {selectedCustomer.email && (
                        <div className="text-sm text-gray-600">{selectedCustomer.email}</div>
                      )}
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full bg-foreground text-background" 
                    disabled={isBillComplete}
                    onClick={() => setShowCustomerModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Customer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Payment Method</Label>
                  <TabSelector
                    defaultValue="cash"
                    onChange={setPaymentMethod}
                    fullWidth
                    variant="default"
                    options={paymentOptions.map(option => ({
                      ...option,
                      disabled: isBillComplete
                    }))}
                  />
                </div>

                {paymentMethod === "card" && !isBillComplete && (
                  <div className="space-y-2">
                    <Label className="text-foreground">Card Details</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Card Number" className="flex-1" />
                      <Input placeholder="MM/YY" className="w-20" />
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && !isBillComplete && (
                  <div className="space-y-2">
                    <Label className="text-foreground">UPI ID</Label>
                    <Input placeholder="Enter UPI ID" />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {!isBillComplete ? (
                  <Button
                    className="w-full bg-blue-600"
                    onClick={handleCompleteSale}
                    disabled={billItems.length === 0 || isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Complete Sale"}
                  </Button>
                ) : (
                  <div className="space-y-4 w-full">
                    <div className="bg-green-50 text-green-700 p-3 rounded-md text-center">
                      Sale completed successfully!
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        <Printer className="h-4 w-4 mr-2" />
                        Print Receipt
                      </Button>
                      <Button className="flex-1 bg-foreground text-background" onClick={handleNewBill}>
                        New Bill
                      </Button>
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Add Customer Modal */}
      {showCustomerModal && (
        <Modal 
          alignment="center"
          contentClassName="max-w-md p-0"
          title="Add New Customer"
          onClose={() => setShowCustomerModal(false)}
        >
          <div className="p-6 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground" htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  className="text-foreground"
                  value={newCustomerData.name}
                  onChange={(e) => setNewCustomerData({...newCustomerData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground" htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  className="text-foreground"
                  value={newCustomerData.phone}
                  onChange={(e) => setNewCustomerData({...newCustomerData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground" htmlFor="email">Email</Label>
                <Input
                  id="email"
                  className="text-foreground"
                  value={newCustomerData.email}
                  onChange={(e) => setNewCustomerData({...newCustomerData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground" htmlFor="address">Address</Label>
                <Input
                  id="address"
                  className="text-foreground"
                  value={newCustomerData.address}
                  onChange={(e) => setNewCustomerData({...newCustomerData, address: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button className="bg-foreground text-background" variant="outline" onClick={() => setShowCustomerModal(false)}>
                Cancel
              </Button>
              <Button className="bg-foreground text-background" onClick={handleAddCustomer}>
                Add Customer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

