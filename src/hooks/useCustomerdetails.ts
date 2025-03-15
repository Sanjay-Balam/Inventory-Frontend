import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { customersAtom } from '@/atoms/customers';
import { PrismaAPIRequest } from '@/lib/utils';
import { Customer } from '@/types/customers';


export function useCustomerDetails() {
  const [customers, setCustomers] = useAtom(customersAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await PrismaAPIRequest('/customers', 'GET');
      setCustomers(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customers';
      setError(errorMessage);
      console.error('Error fetching customers:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const searchCustomers = async (query: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await PrismaAPIRequest(`/customers/search?query=${encodeURIComponent(query)}`, 'GET');
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search customers';
      setError(errorMessage);
      console.error('Error searching customers:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'customer_id' | 'created_at' | 'updated_at' | 'credit_balance' | 'credit_limit'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await PrismaAPIRequest('/customers', 'POST', customerData);
      
      // If this is a new customer (not an existing one returned by the API)
      if (!response.isExisting) {
        setCustomers(prev => [...prev, response]);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add customer';
      setError(errorMessage);
      console.error('Error adding customer:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load customers on initial mount
  useEffect(() => {
    if (customers.length === 0) {
      fetchCustomers();
    }
  }, []);

  return {
    customers,
    isLoading,
    error,
    fetchCustomers,
    searchCustomers,
    addCustomer
  };
}
