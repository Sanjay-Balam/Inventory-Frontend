import { atom } from 'jotai';

// Define interfaces for the data structure
interface Category {
  category_id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface Inventory {
  inventory_id: number;
  product_id: number;
  channel_id: number;
  stock: number;
  last_updated: string;
}

interface Product {
  product_id: number;
  category_id: number;
  name: string;
  sku: string;
  barcode: string;
  price: string;
  cost_price: string;
  quantity: number;
  low_stock_threshold: number;
  color: string | null;
  material: string | null;
  size: string | null;
  final_selling_price: string | null;
  description: string;
  variant_1: string | null;
  variant_2: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  category: Category;
  inventory: Inventory[];
}

// Create the products atom
export const productsAtom = atom<Product[]>([]);
