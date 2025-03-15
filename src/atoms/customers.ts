import { atom } from 'jotai';
import { Customer } from '@/types/customers';

// Atom to store the list of customers
export const customersAtom = atom<Customer[]>([]);
