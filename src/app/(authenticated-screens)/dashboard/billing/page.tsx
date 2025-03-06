"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Trash2, Plus, Minus, Printer, User, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TabSelector } from "@/components/ui/tab-selector"

// Sample product database
const productDatabase = [
  { id: 1, barcode: "8901234567890", name: "T-Shirt Basic", price: 29.99, stock: 201 },
  { id: 2, barcode: "8902345678901", name: "Coffee Maker", price: 89.99, stock: 74 },
  { id: 3, barcode: "8903456789012", name: "Cotton Shirt", price: 1200.0, stock: 51 },
  { id: 4, barcode: "8904567890123", name: "Cotton Pant", price: 1200.0, stock: 50 },
  { id: 5, barcode: "8905678901234", name: "Denim Jeans", price: 2000.0, stock: 32 },
  { id: 6, barcode: "8906789012345", name: "Laptop Pro", price: 1299.99, stock: 10 },
  { id: 7, barcode: "8907890123456", name: "Smartphone X", price: 599.99, stock: 101 },
]

interface BillItem {
  id: number
  barcode: string
  name: string
  price: number
  quantity: number
  subtotal: number
}

export default function BillingPage() {
  const [barcodeInput, setBarcodeInput] = useState("")
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [customer, setCustomer] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(18) // Default GST rate
  const [isProcessing, setIsProcessing] = useState(false)
  const [isBillComplete, setIsBillComplete] = useState(false)
  const barcodeInputRef = useRef<HTMLInputElement>(null)

  // Focus on barcode input when page loads
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus()
    }
  }, [])

  // Calculate totals
  const subtotal = billItems.reduce((sum, item) => sum + item.subtotal, 0)
  const discountAmount = (subtotal * discount) / 100
  const taxAmount = ((subtotal - discountAmount) * tax) / 100
  const total = subtotal - discountAmount + taxAmount

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!barcodeInput.trim()) return

    // Find product by barcode
    const product = productDatabase.find((p) => p.barcode === barcodeInput)

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
        setBillItems([
          ...billItems,
          {
            id: product.id,
            barcode: product.barcode,
            name: product.name,
            price: product.price,
            quantity: 1,
            subtotal: product.price,
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
        <h1 className="text-2xl font-bold">Billing</h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    className="pl-9"
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
            <CardHeader className="pb-3">
              <CardTitle>Bill Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No items added to bill yet. Scan products to begin.
                        </TableCell>
                      </TableRow>
                    ) : (
                      billItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">{item.barcode}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>₹ {item.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                disabled={isBillComplete}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                disabled={isBillComplete}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>₹ {item.subtotal.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
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
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          <Card>
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
                </div>
                <Button variant="outline" className="w-full bg-foreground text-background" disabled={isBillComplete}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Customer
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Discount</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-16 h-8 text-right text-foreground"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      disabled={isBillComplete}
                    />
                    <span className="text-foreground">%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Tax (GST)</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-16 h-8 text-right text-foreground"
                      value={tax}
                      onChange={(e) => setTax(Number(e.target.value))}
                      disabled={isBillComplete}
                    />
                    <span className="text-foreground">%</span>
                  </div>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium text-lg">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">₹ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>    

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
  )
}

