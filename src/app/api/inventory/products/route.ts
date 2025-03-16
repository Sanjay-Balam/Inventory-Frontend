import { NextResponse } from 'next/server';
import { z } from 'zod';

interface Product {
  product_id: number;
  name: string;
  sku: string;
  barcode: string;
  quantity: number;
  price: string;
  cost_price: string;
  category: {
    name: string;
  };
}

// Mock database for demonstration
let products: Product[] = [
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

// Product schema for validation
const productSchema = z.object({
  name: z.string().min(1),
  category_id: z.string(),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  cost_price: z.string(),
  price: z.string(),
  quantity: z.string(),
  low_stock_threshold: z.string(),
  color: z.string().optional(),
  material: z.string().optional(),
  size: z.string().optional(),
  variant_1: z.string().optional(),
  variant_2: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().optional(),
  final_selling_price: z.string().optional(),
});

export async function GET() {
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Generate a unique product ID
    const product_id = products.length + 1;

    // Create new product
    const newProduct: Product = {
      product_id,
      name: validatedData.name,
      sku: validatedData.sku,
      barcode: validatedData.barcode || `PROD${product_id.toString().padStart(6, '0')}`,
      quantity: parseInt(validatedData.quantity),
      price: validatedData.price,
      cost_price: validatedData.cost_price,
      category: {
        name: "Uncategorized" // In a real app, we would look up the category name
      }
    };

    // Add to mock database
    products.push(newProduct);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
