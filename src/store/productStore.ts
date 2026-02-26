import { create } from 'zustand';
import type { Product } from '../types';
import { createResource, deleteResource, listResource, patchResource } from '../api/resources';
import { showApiErrorToast } from './apiErrors';
import { generateId } from '../utils/id';

interface ProductStore {
  products: Product[];
  isLoading: boolean;
  isLoaded: boolean;
  loadProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  isLoading: false,
  isLoaded: false,
  loadProducts: async () => {
    if (get().isLoading || get().isLoaded) return;
    set({ isLoading: true });
    try {
      const products = await listResource<Product>('products');
      set({ products, isLoaded: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      showApiErrorToast('Could not load products', 'Please check API connectivity and retry.', error);
    }
  },
  addProduct: (data) => {
    const newProduct: Product = { ...data, id: generateId('product') };
    set((s) => ({ products: [...s.products, newProduct] }));
    void createResource('products', newProduct).catch((error) => {
      set((s) => ({ products: s.products.filter((p) => p.id !== newProduct.id) }));
      showApiErrorToast('Could not create product', 'Please try again.', error);
    });
  },
  updateProduct: (id, data) => {
    const prevProduct = useProductStore.getState().products.find((p) => p.id === id);
    set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)) }));
    void patchResource<Product>('products', id, data).catch((error) => {
      if (prevProduct) {
        set((s) => ({ products: s.products.map((p) => (p.id === id ? prevProduct : p)) }));
      }
      showApiErrorToast('Could not update product', 'Changes were reverted.', error);
    });
  },
  deleteProduct: (id) => {
    const removedProduct = useProductStore.getState().products.find((p) => p.id === id);
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
    void deleteResource('products', id).catch((error) => {
      if (removedProduct) {
        set((s) => ({ products: [...s.products, removedProduct] }));
      }
      showApiErrorToast('Could not delete product', 'The item was restored.', error);
    });
  },
}));
