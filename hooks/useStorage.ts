
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, Subcategory, Product, StockMovement } from '../types';

const STORAGE_KEYS = {
  CATEGORIES: 'categories',
  SUBCATEGORIES: 'subcategories',
  PRODUCTS: 'products',
  STOCK_MOVEMENTS: 'stock_movements',
};

export const useStorage = () => {
  // Categories
  const getCategories = async (): Promise<Category[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.log('Error getting categories:', error);
      return [];
    }
  };

  const saveCategories = async (categories: Category[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.log('Error saving categories:', error);
    }
  };

  // Subcategories
  const getSubcategories = async (): Promise<Subcategory[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBCATEGORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.log('Error getting subcategories:', error);
      return [];
    }
  };

  const saveSubcategories = async (subcategories: Subcategory[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SUBCATEGORIES, JSON.stringify(subcategories));
    } catch (error) {
      console.log('Error saving subcategories:', error);
    }
  };

  // Products
  const getProducts = async (): Promise<Product[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.log('Error getting products:', error);
      return [];
    }
  };

  const saveProducts = async (products: Product[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (error) {
      console.log('Error saving products:', error);
    }
  };

  // Stock Movements
  const getStockMovements = async (): Promise<StockMovement[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.log('Error getting stock movements:', error);
      return [];
    }
  };

  const saveStockMovements = async (movements: StockMovement[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(movements));
    } catch (error) {
      console.log('Error saving stock movements:', error);
    }
  };

  return {
    getCategories,
    saveCategories,
    getSubcategories,
    saveSubcategories,
    getProducts,
    saveProducts,
    getStockMovements,
    saveStockMovements,
  };
};
