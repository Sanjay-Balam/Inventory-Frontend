import { NextResponse } from 'next/server';

// Mock test products with barcodes
const testProducts = [
  {
    barcode: "987654321098",
    name: "Test Product 1",
    sku: "TEST001"
  },
  {
    barcode: "112342000911",
    name: "Test Product 2",
    sku: "TEST002"
  },
  {
    barcode: "943017293025",
    name: "Test Product 3",
    sku: "TEST003"
  }
];

export async function GET() {
  return NextResponse.json(testProducts);
}
