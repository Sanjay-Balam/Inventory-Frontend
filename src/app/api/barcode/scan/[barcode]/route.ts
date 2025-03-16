import { NextResponse } from 'next/server';

// Mock database for demonstration
const products = [
  {
    product_id: 1,
    name: "Premium Laptop",
    sku: "LAP001",
    barcode: "123456789012",
    quantity: 50,
    price: "1299.99",
    cost_price: "999.99",
    category: {
      name: "Electronics"
    }
  },
  {
    product_id: 2,
    name: "Wireless Earbuds",
    sku: "EAR001",
    barcode: "987654321098",
    quantity: 100,
    price: "199.99",
    cost_price: "89.99",
    category: {
      name: "Audio"
    }
  }
];

export async function GET(
  request: Request,
  { params }: { params: { barcode: string } }
) {
  const { barcode } = params;

  // Find product by barcode
  const product = products.find(p => p.barcode === barcode);

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(product);
}
