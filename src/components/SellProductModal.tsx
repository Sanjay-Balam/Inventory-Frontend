"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PrismaAPIRequest } from "@/lib/utils"
import BarcodeScanner from './BarcodeScanner';

interface Product {
  product_id: number
  name: string
  price: string
  quantity: number
}

interface SellProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

export function SellProductModal({ isOpen, onClose, product }: SellProductModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    quantity: "1",
    channel_id: "1",
    user_id: "1",
  })
  const [showScanner, setShowScanner] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string>('');

  const handleScan = async (barcode: string) => {
    setScannedBarcode(barcode);
    setShowScanner(false);
    // Call your existing API to fetch product details by barcode
    try {
      const response = await fetch(`/api/barcode/scan/${barcode}`);
      if (response.ok) {
        const product = await response.json();
        // Update your form with the product details
        // ... your existing product handling code ...
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setLoading(true)
    setError(null)

    try {
      // Create or get customer
      const customerData = {
        name: formData.customer_name,
        phone: formData.customer_phone,
        email: formData.customer_email || undefined
      }

      const customerResponse = await fetch('http://localhost:3000/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      })

      if (!customerResponse.ok) {
        const errorData = await customerResponse.json()
        throw new Error(errorData.error || 'Failed to create/get customer')
      }

      const customer = await customerResponse.json()
      console.log('Customer created/found:', customer)

      // Create order with the customer
      const orderData = {
        customer_id: customer.customer_id,
        channel_id: formData.channel_id,
        user_id: formData.user_id,
        items: [{
          product_id: product.product_id,
          quantity: parseInt(formData.quantity),
          price: product.price
        }]
      }

      const orderResponse = await fetch('http://localhost:3000/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const order = await orderResponse.json()
      console.log('Order created:', order)

      // Reset form and close modal
      setFormData({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        quantity: "1",
        channel_id: "1",
        user_id: "1",
      })
      onClose()

    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!product || !isOpen) return null

  const totalAmount = parseFloat(product.price) * parseInt(formData.quantity || "0")

  return (
    <Modal
      title="Sell Product"
      onClose={onClose}
      alignment="center"
      contentClassName="max-w-md p-6"
    >
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Sell Product</h2>
        
        {!showScanner ? (
          <button
            onClick={() => setShowScanner(true)}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Scan Barcode
          </button>
        ) : (
          <div className="mb-4">
            <BarcodeScanner
              onScan={handleScan}
              onError={(error) => console.error('Scanner error:', error)}
            />
            <button
              onClick={() => setShowScanner(false)}
              className="mt-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel Scan
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-white border rounded-lg">
            <CardHeader className="bg-gray-50 border-b px-4 py-3">
              <CardTitle className="text-lg font-semibold">Product Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-sm space-y-2">
                <p><span className="font-medium">Name:</span> {product.name}</p>
                <p><span className="font-medium">Price:</span> ₹{product.price}</p>
                <p><span className="font-medium">Available:</span> {product.quantity}</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name *</Label>
              <Input
                id="customer_name"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
                className="border-gray-300"
                placeholder="Enter customer name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_phone">Customer Phone *</Label>
              <Input
                id="customer_phone"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleChange}
                required
                className="border-gray-300"
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_email">Customer Email</Label>
              <Input
                id="customer_email"
                name="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={handleChange}
                className="border-gray-300"
                placeholder="Enter email (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                max={product.quantity}
                value={formData.quantity}
                onChange={handleChange}
                required
                className="border-gray-300"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-lg font-medium">Total Amount: ₹{totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-white border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </div>
              ) : (
                'Complete Sale'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}