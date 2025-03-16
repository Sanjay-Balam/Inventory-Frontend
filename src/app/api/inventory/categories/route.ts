import { NextResponse } from 'next/server';

// Mock categories for demonstration
const categories = [
  {
    category_id: 1,
    name: "Electronics"
  },
  {
    category_id: 2,
    name: "Audio"
  },
  {
    category_id: 3,
    name: "Accessories"
  },
  {
    category_id: 4,
    name: "Computers"
  }
];

export async function GET() {
  return NextResponse.json(categories);
}
