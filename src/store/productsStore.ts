import { create } from 'zustand';
import { fetchProducts as apiFetchProducts } from '../api/api';
import type { Product, SortField, SortOrder } from '../types';

interface ProductsState {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  searchQuery: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  selectedIds: Set<number>;

  fetchProducts: () => Promise<void>;
  setPage: (page: number) => void;
  setSearch: (query: string) => void;
  setSort: (field: SortField) => void;
  toggleSelect: (id: number) => void;
  toggleSelectAll: () => void;
  addLocalProduct: (product: Product) => void;
  refresh: () => Promise<void>;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  total: 0,
  page: 1,
  limit: 20,
  loading: false,
  searchQuery: '',
  sortBy: '',
  sortOrder: 'asc',
  selectedIds: new Set(),

  fetchProducts: async () => {
    const { page, limit, sortBy, sortOrder, searchQuery } = get();
    set({ loading: true });
    try {
      const skip = (page - 1) * limit;
      const data = await apiFetchProducts({
        limit,
        skip,
        sortBy: sortBy || undefined,
        order: sortBy ? sortOrder : undefined,
        search: searchQuery || undefined,
      });
      set({
        products: data.products,
        total: data.total,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  setPage: (page: number) => {
    set({ page });
    get().fetchProducts();
  },

  setSearch: (query: string) => {
    set({ searchQuery: query, page: 1 });
    get().fetchProducts();
  },

  setSort: (field: SortField) => {
    const { sortBy, sortOrder } = get();
    if (sortBy === field) {
      set({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      set({ sortBy: field, sortOrder: 'asc' });
    }
    set({ page: 1 });
    get().fetchProducts();
  },

  toggleSelect: (id: number) => {
    const { selectedIds } = get();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    set({ selectedIds: newSet });
  },

  toggleSelectAll: () => {
    const { products, selectedIds } = get();
    if (selectedIds.size === products.length) {
      set({ selectedIds: new Set() });
    } else {
      set({ selectedIds: new Set(products.map((p) => p.id)) });
    }
  },

  addLocalProduct: (product: Product) => {
    set((state) => ({
      products: [product, ...state.products],
      total: state.total + 1,
    }));
  },

  refresh: async () => {
    await get().fetchProducts();
  },
}));
