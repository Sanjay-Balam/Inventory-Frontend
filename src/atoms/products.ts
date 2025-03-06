import axios from 'axios';
import { atom } from 'jotai';


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

export interface Product {
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

export const fetchProducts = atom(
  async (get) => {
    try {
      const response = await axios.get("/api/products");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch products:", error);
      return [];
    }
  },
  (get, set, update: Product[]) => {
    set(productsAtom, update);
  }
);

export const updateStock = atom(
  null,
  async (get, set, { product_id, channel_id, stock }) => {
    try {
      await axios.post("/api/update-stock", { product_id, channel_id, stock });
      const updatedProducts = await get(fetchProducts);
      set(productsAtom, updatedProducts);
    } catch (error) {
      console.error("Failed to update stock:", error);
    }
  }
);
