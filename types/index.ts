
export interface Category {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  barcode: string;
  quantity: number;
  subcategoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'add' | 'remove' | 'modify';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  timestamp: Date;
}

export type SearchResult = {
  type: 'category' | 'subcategory' | 'product';
  item: Category | Subcategory | Product;
};
