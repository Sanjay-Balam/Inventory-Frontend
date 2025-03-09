import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { productsAtom } from '@/atoms/products';
import { PrismaAPIRequest } from '@/lib/utils';

export const useProducts = () => {
  const [products, setProducts] = useAtom(productsAtom);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await PrismaAPIRequest("/inventory/products", "GET");
      setProducts(response || []);
      return response;
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
      return [];
    }
  }, [setProducts]);

  return {
    products,
    fetchProducts,
  };
};
