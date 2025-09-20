
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

  const updateCategory = async (categoryId: string, name: string): Promise<void> => {
    const updatedCategories = categories.map(category =>
      category.id === categoryId ? { ...category, name } : category
    );
    setCategories(updatedCategories);
    await storage.saveCategories(updatedCategories);
  };

  const removeCategory = async (categoryId: string): Promise<void> => {
    // First, remove all subcategories associated with this category
    const subcategoriesToRemove = subcategories.filter(sub => sub.categoryId === categoryId);
    
    // Remove all products associated with subcategories of this category
    for (const subcategory of subcategoriesToRemove) {
      await removeSubcategory(subcategory.id);
    }

    // Remove the category
    const updatedCategories = categories.filter(category => category.id !== categoryId);
    setCategories(updatedCategories);
    await storage.saveCategories(updatedCategories);
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

  const updateSubcategory = async (subcategoryId: string, name: string): Promise<void> => {
    const updatedSubcategories = subcategories.map(subcategory =>
      subcategory.id === subcategoryId ? { ...subcategory, name } : subcategory
    );
    setSubcategories(updatedSubcategories);
    await storage.saveSubcategories(updatedSubcategories);
  };

  const removeSubcategory = async (subcategoryId: string): Promise<void> => {
    // Remove all products associated with this subcategory
    const productsToRemove = products.filter(product => product.subcategoryId === subcategoryId);
    const updatedProducts = products.filter(product => product.subcategoryId !== subcategoryId);
    
    // Remove stock movements for deleted products
    const productIdsToRemove = productsToRemove.map(p => p.id);
    const updatedMovements = stockMovements.filter(movement => 
      !productIdsToRemove.includes(movement.productId)
    );

    // Update state
    setProducts(updatedProducts);
    setStockMovements(updatedMovements);
    
    // Remove the subcategory
    const updatedSubcategories = subcategories.filter(subcategory => subcategory.id !== subcategoryId);
    setSubcategories(updatedSubcategories);

    // Save to storage
    await Promise.all([
      storage.saveProducts(updatedProducts),
      storage.saveStockMovements(updatedMovements),
      storage.saveSubcategories(updatedSubcategories),
    ]);
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
    updateCategory,
    removeCategory,
    addSubcategory,
    updateSubcategory,
    removeSubcategory,
    getSubcategoriesByCategory,
    addProduct,
    updateProductQuantity,
    getProductByBarcode,
    getProductsBySubcategory,
    search,
    loadData,
  };
};
