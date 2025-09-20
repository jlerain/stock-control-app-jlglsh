
import { useState, useEffect } from 'react';
import { Category, Subcategory, Product, StockMovement, SearchResult } from '../types';
import { useStorage } from './useStorage';

export const useStockManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const storage = useStorage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, subcategoriesData, productsData, movementsData] = await Promise.all([
        storage.getCategories(),
        storage.getSubcategories(),
        storage.getProducts(),
        storage.getStockMovements(),
      ]);

      setCategories(categoriesData);
      setSubcategories(subcategoriesData);
      setProducts(productsData);
      setStockMovements(movementsData);
    } catch (error) {
      console.log('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Categories
  const addCategory = async (name: string): Promise<Category> => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      createdAt: new Date(),
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    await storage.saveCategories(updatedCategories);
    return newCategory;
  };

  // Subcategories
  const addSubcategory = async (name: string, categoryId: string): Promise<Subcategory> => {
    const newSubcategory: Subcategory = {
      id: Date.now().toString(),
      name,
      categoryId,
      createdAt: new Date(),
    };

    const updatedSubcategories = [...subcategories, newSubcategory];
    setSubcategories(updatedSubcategories);
    await storage.saveSubcategories(updatedSubcategories);
    return newSubcategory;
  };

  const getSubcategoriesByCategory = (categoryId: string): Subcategory[] => {
    return subcategories.filter(sub => sub.categoryId === categoryId);
  };

  // Products
  const addProduct = async (
    name: string,
    description: string,
    barcode: string,
    quantity: number,
    subcategoryId: string
  ): Promise<Product> => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name,
      description,
      barcode,
      quantity,
      subcategoryId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    await storage.saveProducts(updatedProducts);

    // Add stock movement
    await addStockMovement(newProduct.id, 'add', quantity, 0, quantity);

    return newProduct;
  };

  const updateProductQuantity = async (
    productId: string,
    newQuantity: number,
    type: 'add' | 'remove' | 'modify'
  ): Promise<void> => {
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) return;

    const product = products[productIndex];
    const previousQuantity = product.quantity;
    
    const updatedProduct = {
      ...product,
      quantity: newQuantity,
      updatedAt: new Date(),
    };

    const updatedProducts = [...products];
    updatedProducts[productIndex] = updatedProduct;
    
    setProducts(updatedProducts);
    await storage.saveProducts(updatedProducts);

    // Add stock movement
    await addStockMovement(productId, type, Math.abs(newQuantity - previousQuantity), previousQuantity, newQuantity);
  };

  const getProductByBarcode = (barcode: string): Product | undefined => {
    return products.find(p => p.barcode === barcode);
  };

  const getProductsBySubcategory = (subcategoryId: string): Product[] => {
    return products.filter(p => p.subcategoryId === subcategoryId);
  };

  // Stock Movements
  const addStockMovement = async (
    productId: string,
    type: 'add' | 'remove' | 'modify',
    quantity: number,
    previousQuantity: number,
    newQuantity: number
  ): Promise<void> => {
    const newMovement: StockMovement = {
      id: Date.now().toString(),
      productId,
      type,
      quantity,
      previousQuantity,
      newQuantity,
      timestamp: new Date(),
    };

    const updatedMovements = [...stockMovements, newMovement];
    setStockMovements(updatedMovements);
    await storage.saveStockMovements(updatedMovements);
  };

  // Search
  const search = (query: string): SearchResult[] => {
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search categories
    categories.forEach(category => {
      if (category.name.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'category', item: category });
      }
    });

    // Search subcategories
    subcategories.forEach(subcategory => {
      if (subcategory.name.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'subcategory', item: subcategory });
      }
    });

    // Search products
    products.forEach(product => {
      if (product.name.toLowerCase().includes(lowerQuery) || 
          product.description.toLowerCase().includes(lowerQuery)) {
        results.push({ type: 'product', item: product });
      }
    });

    return results;
  };

  return {
    categories,
    subcategories,
    products,
    stockMovements,
    loading,
    addCategory,
    addSubcategory,
    getSubcategoriesByCategory,
    addProduct,
    updateProductQuantity,
    getProductByBarcode,
    getProductsBySubcategory,
    search,
    loadData,
  };
};
