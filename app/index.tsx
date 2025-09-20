
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors } from '../styles/commonStyles';
import { useStockManager } from '../hooks/useStockManager';
import { Product, SearchResult } from '../types';
import Scanner from '../components/Scanner';
import ProductActionSheet from '../components/ProductActionSheet';
import CreateProductSheet from '../components/CreateProductSheet';
import Icon from '../components/Icon';

export default function MainScreen() {
  const [currentView, setCurrentView] = useState<'home' | 'scanner' | 'categories' | 'search'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductActions, setShowProductActions] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');

  const {
    categories,
    subcategories,
    products,
    loading,
    addCategory,
    addSubcategory,
    addProduct,
    updateProductQuantity,
    getProductByBarcode,
    getProductsBySubcategory,
    search,
  } = useStockManager();

  const handleBarCodeScanned = (barcode: string) => {
    console.log('Barcode scanned in main:', barcode);
    setCurrentView('home');
    
    const existingProduct = getProductByBarcode(barcode);
    if (existingProduct) {
      setSelectedProduct(existingProduct);
      setShowProductActions(true);
    } else {
      setScannedBarcode(barcode);
      setShowCreateProduct(true);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = search(query.trim());
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchResultPress = (result: SearchResult) => {
    if (result.type === 'product') {
      setSelectedProduct(result.item as Product);
      setShowProductActions(true);
    }
    // TODO: Handle category and subcategory navigation
  };

  const handleAddQuantity = async (quantity: number) => {
    if (!selectedProduct) return;
    const newQuantity = selectedProduct.quantity + quantity;
    await updateProductQuantity(selectedProduct.id, newQuantity, 'add');
    setSelectedProduct({ ...selectedProduct, quantity: newQuantity });
  };

  const handleRemoveQuantity = async (quantity: number) => {
    if (!selectedProduct) return;
    const newQuantity = Math.max(0, selectedProduct.quantity - quantity);
    await updateProductQuantity(selectedProduct.id, newQuantity, 'remove');
    setSelectedProduct({ ...selectedProduct, quantity: newQuantity });
  };

  const handleModifyProduct = async (updatedProduct: Product) => {
    // For now, we'll just update the local state
    // In a real app, you'd want to update the storage
    setSelectedProduct(updatedProduct);
  };

  const handleCreateProduct = async (
    name: string,
    description: string,
    quantity: number,
    subcategoryId: string
  ) => {
    await addProduct(name, description, scannedBarcode, quantity, subcategoryId);
    Alert.alert('Succès', 'Produit créé avec succès');
  };

  if (loading) {
    return (
      <SafeAreaView style={[commonStyles.container, commonStyles.centerContent]}>
        <Text style={commonStyles.text}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  if (currentView === 'scanner') {
    return (
      <Scanner
        onBarCodeScanned={handleBarCodeScanned}
        onClose={() => setCurrentView('home')}
      />
    );
  }

  const renderHomeView = () => (
    <View style={commonStyles.content}>
      <Text style={commonStyles.title}>Gestion de Stock</Text>
      
      <TextInput
        style={commonStyles.searchInput}
        placeholder="Rechercher un produit, catégorie..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {searchResults.length > 0 && (
        <ScrollView style={{ maxHeight: 200, marginBottom: 20 }}>
          {searchResults.map((result, index) => (
            <TouchableOpacity
              key={index}
              style={commonStyles.card}
              onPress={() => handleSearchResultPress(result)}
            >
              <Text style={commonStyles.text}>{result.item.name}</Text>
              <Text style={commonStyles.textSecondary}>
                {result.type === 'category' ? 'Catégorie' : 
                 result.type === 'subcategory' ? 'Sous-catégorie' : 'Produit'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={commonStyles.section}>
        <Text style={commonStyles.subtitle}>Statistiques</Text>
        <View style={commonStyles.row}>
          <View style={[commonStyles.card, { flex: 1, marginRight: 10 }]}>
            <Text style={commonStyles.textSecondary}>Produits</Text>
            <Text style={commonStyles.title}>{products.length}</Text>
          </View>
          <View style={[commonStyles.card, { flex: 1, marginLeft: 10 }]}>
            <Text style={commonStyles.textSecondary}>Catégories</Text>
            <Text style={commonStyles.title}>{categories.length}</Text>
          </View>
        </View>
      </View>

      <View style={commonStyles.section}>
        <Text style={commonStyles.subtitle}>Produits récents</Text>
        <ScrollView>
          {products.slice(-5).reverse().map(product => (
            <TouchableOpacity
              key={product.id}
              style={commonStyles.card}
              onPress={() => {
                setSelectedProduct(product);
                setShowProductActions(true);
              }}
            >
              <Text style={commonStyles.text}>{product.name}</Text>
              <Text style={commonStyles.textSecondary}>Stock: {product.quantity}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderCategoriesView = () => (
    <View style={commonStyles.content}>
      <Text style={commonStyles.title}>Catégories</Text>
      
      <ScrollView>
        {categories.map(category => {
          const categorySubcategories = subcategories.filter(sub => sub.categoryId === category.id);
          return (
            <View key={category.id} style={commonStyles.card}>
              <Text style={commonStyles.subtitle}>{category.name}</Text>
              {categorySubcategories.map(subcategory => {
                const subcategoryProducts = getProductsBySubcategory(subcategory.id);
                return (
                  <View key={subcategory.id} style={{ marginLeft: 10, marginTop: 10 }}>
                    <Text style={commonStyles.text}>{subcategory.name}</Text>
                    <Text style={commonStyles.textSecondary}>
                      {subcategoryProducts.length} produit(s)
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      {currentView === 'home' && renderHomeView()}
      {currentView === 'categories' && renderCategoriesView()}

      {/* Bottom Navigation */}
      <View style={commonStyles.bottomNavigation}>
        <TouchableOpacity
          style={commonStyles.navItem}
          onPress={() => setCurrentView('home')}
        >
          <Icon 
            name="home" 
            size={24} 
            color={currentView === 'home' ? colors.primary : colors.text} 
          />
          <Text style={[
            commonStyles.textSecondary,
            { fontSize: 12, marginTop: 4 },
            currentView === 'home' && { color: colors.primary }
          ]}>
            Accueil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={commonStyles.navItem}
          onPress={() => setCurrentView('scanner')}
        >
          <Icon name="barcode" size={24} color={colors.text} />
          <Text style={[commonStyles.textSecondary, { fontSize: 12, marginTop: 4 }]}>
            Scanner
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={commonStyles.navItem}
          onPress={() => setCurrentView('categories')}
        >
          <Icon 
            name="list" 
            size={24} 
            color={currentView === 'categories' ? colors.primary : colors.text} 
          />
          <Text style={[
            commonStyles.textSecondary,
            { fontSize: 12, marginTop: 4 },
            currentView === 'categories' && { color: colors.primary }
          ]}>
            Catégories
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheets */}
      <ProductActionSheet
        isVisible={showProductActions}
        onClose={() => {
          setShowProductActions(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onAddQuantity={handleAddQuantity}
        onRemoveQuantity={handleRemoveQuantity}
        onModifyProduct={handleModifyProduct}
      />

      <CreateProductSheet
        isVisible={showCreateProduct}
        onClose={() => {
          setShowCreateProduct(false);
          setScannedBarcode('');
        }}
        barcode={scannedBarcode}
        categories={categories}
        subcategories={subcategories}
        onCreateProduct={handleCreateProduct}
        onCreateCategory={addCategory}
        onCreateSubcategory={addSubcategory}
      />
    </SafeAreaView>
  );
}
