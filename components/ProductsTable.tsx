
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Product, Category, Subcategory } from '../types';
import { commonStyles, colors } from '../styles/commonStyles';

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  subcategories: Subcategory[];
}

interface OrganizedProduct extends Product {
  categoryName: string;
  subcategoryName: string;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ products, categories, subcategories }) => {
  // Organize products by category and subcategory
  const organizeProducts = (): OrganizedProduct[] => {
    const organizedProducts: OrganizedProduct[] = products.map(product => {
      const subcategory = subcategories.find(sub => sub.id === product.subcategoryId);
      const category = subcategory ? categories.find(cat => cat.id === subcategory.categoryId) : undefined;
      
      return {
        ...product,
        categoryName: category?.name || 'Sans catégorie',
        subcategoryName: subcategory?.name || 'Sans sous-catégorie'
      };
    });

    // Sort alphabetically by category, then subcategory, then product name
    return organizedProducts.sort((a, b) => {
      if (a.categoryName !== b.categoryName) {
        return a.categoryName.localeCompare(b.categoryName);
      }
      if (a.subcategoryName !== b.subcategoryName) {
        return a.subcategoryName.localeCompare(b.subcategoryName);
      }
      return a.name.localeCompare(b.name);
    });
  };

  const organizedProducts = organizeProducts();

  // Group products by category and subcategory for display
  const groupedProducts = organizedProducts.reduce((acc, product) => {
    const key = `${product.categoryName}|${product.subcategoryName}`;
    if (!acc[key]) {
      acc[key] = {
        categoryName: product.categoryName,
        subcategoryName: product.subcategoryName,
        products: []
      };
    }
    acc[key].products.push(product);
    return acc;
  }, {} as Record<string, { categoryName: string; subcategoryName: string; products: OrganizedProduct[] }>);

  if (products.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Produits</Text>
        <View style={styles.emptyState}>
          <Text style={commonStyles.textSecondary}>Aucun produit en stock</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Produits ({products.length})</Text>
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {Object.values(groupedProducts).map((group, groupIndex) => (
          <View key={groupIndex} style={styles.categoryGroup}>
            {/* Category and Subcategory Header */}
            <View style={styles.groupHeader}>
              <Text style={styles.categoryText}>{group.categoryName}</Text>
              <Text style={styles.subcategoryText}>{group.subcategoryName}</Text>
            </View>
            
            {/* Products Table */}
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.descriptionColumn]}>Description</Text>
                <Text style={[styles.tableHeaderText, styles.quantityColumn]}>Stock</Text>
              </View>
              
              {/* Table Rows */}
              {group.products.map((product, productIndex) => (
                <View 
                  key={product.id} 
                  style={[
                    styles.tableRow,
                    productIndex % 2 === 0 ? styles.evenRow : styles.oddRow
                  ]}
                >
                  <Text style={[styles.tableCell, styles.descriptionColumn]} numberOfLines={2}>
                    {product.description || product.name}
                  </Text>
                  <Text style={[styles.tableCell, styles.quantityColumn, styles.quantityText]}>
                    {product.quantity}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    maxHeight: 400, // Limit height to prevent taking too much space
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
  },
  categoryGroup: {
    marginBottom: 20,
  },
  groupHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  subcategoryText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  table: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  evenRow: {
    backgroundColor: 'white',
  },
  oddRow: {
    backgroundColor: colors.backgroundAlt,
  },
  tableCell: {
    fontSize: 14,
    color: colors.text,
  },
  descriptionColumn: {
    flex: 1,
    paddingRight: 12,
  },
  quantityColumn: {
    width: 60,
    textAlign: 'center',
  },
  quantityText: {
    fontWeight: '600',
    color: colors.primary,
  },
});

export default ProductsTable;
