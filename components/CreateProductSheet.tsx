
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Category, Subcategory } from '../types';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import SimpleBottomSheet from './BottomSheet';
import Button from './Button';

interface CreateProductSheetProps {
  isVisible: boolean;
  onClose: () => void;
  barcode: string;
  categories: Category[];
  subcategories: Subcategory[];
  onCreateProduct: (
    name: string,
    description: string,
    quantity: number,
    subcategoryId: string
  ) => void;
  onCreateCategory: (name: string) => Promise<Category>;
  onCreateSubcategory: (name: string, categoryId: string) => Promise<Subcategory>;
}

export default function CreateProductSheet({
  isVisible,
  onClose,
  barcode,
  categories,
  subcategories,
  onCreateProduct,
  onCreateCategory,
  onCreateSubcategory,
}: CreateProductSheetProps) {
  const [step, setStep] = useState<'product' | 'category' | 'subcategory'>('product');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');

  useEffect(() => {
    if (isVisible) {
      resetForm();
    }
  }, [isVisible]);

  const resetForm = () => {
    setStep('product');
    setName('');
    setDescription('');
    setQuantity('');
    setSelectedCategoryId('');
    setSelectedSubcategoryId('');
    setNewCategoryName('');
    setNewSubcategoryName('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreateProduct = () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom du produit est requis');
      return;
    }
    if (!selectedSubcategoryId) {
      Alert.alert('Erreur', 'Veuillez sélectionner une sous-catégorie');
      return;
    }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) {
      Alert.alert('Erreur', 'Veuillez entrer une quantité valide');
      return;
    }

    onCreateProduct(name.trim(), description.trim(), qty, selectedSubcategoryId);
    handleClose();
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Erreur', 'Le nom de la catégorie est requis');
      return;
    }

    try {
      const category = await onCreateCategory(newCategoryName.trim());
      setSelectedCategoryId(category.id);
      setNewCategoryName('');
      setStep('product');
    } catch (error) {
      console.log('Error creating category:', error);
      Alert.alert('Erreur', 'Impossible de créer la catégorie');
    }
  };

  const handleCreateSubcategory = async () => {
    if (!newSubcategoryName.trim()) {
      Alert.alert('Erreur', 'Le nom de la sous-catégorie est requis');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return;
    }

    try {
      const subcategory = await onCreateSubcategory(newSubcategoryName.trim(), selectedCategoryId);
      setSelectedSubcategoryId(subcategory.id);
      setNewSubcategoryName('');
      setStep('product');
    } catch (error) {
      console.log('Error creating subcategory:', error);
      Alert.alert('Erreur', 'Impossible de créer la sous-catégorie');
    }
  };

  const getFilteredSubcategories = () => {
    return subcategories.filter(sub => sub.categoryId === selectedCategoryId);
  };

  const renderProductForm = () => (
    <ScrollView>
      <Text style={commonStyles.title}>Nouveau produit</Text>
      <Text style={commonStyles.textSecondary}>Code-barre: {barcode}</Text>

      <TextInput
        style={commonStyles.input}
        placeholder="Nom du produit"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={commonStyles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <TextInput
        style={commonStyles.input}
        placeholder="Quantité initiale"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />

      <Text style={commonStyles.subtitle}>Catégorie</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              commonStyles.card,
              { marginRight: 10, minWidth: 120 },
              selectedCategoryId === category.id && { backgroundColor: colors.primary }
            ]}
            onPress={() => {
              setSelectedCategoryId(category.id);
              setSelectedSubcategoryId('');
            }}
          >
            <Text style={[
              commonStyles.text,
              selectedCategoryId === category.id && { color: colors.background }
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[commonStyles.card, { marginRight: 10, minWidth: 120, borderStyle: 'dashed' }]}
          onPress={() => setStep('category')}
        >
          <Text style={[commonStyles.text, { textAlign: 'center' }]}>+ Nouvelle</Text>
        </TouchableOpacity>
      </ScrollView>

      {selectedCategoryId && (
        <>
          <Text style={commonStyles.subtitle}>Sous-catégorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {getFilteredSubcategories().map(subcategory => (
              <TouchableOpacity
                key={subcategory.id}
                style={[
                  commonStyles.card,
                  { marginRight: 10, minWidth: 120 },
                  selectedSubcategoryId === subcategory.id && { backgroundColor: colors.primary }
                ]}
                onPress={() => setSelectedSubcategoryId(subcategory.id)}
              >
                <Text style={[
                  commonStyles.text,
                  selectedSubcategoryId === subcategory.id && { color: colors.background }
                ]}>
                  {subcategory.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[commonStyles.card, { marginRight: 10, minWidth: 120, borderStyle: 'dashed' }]}
              onPress={() => setStep('subcategory')}
            >
              <Text style={[commonStyles.text, { textAlign: 'center' }]}>+ Nouvelle</Text>
            </TouchableOpacity>
          </ScrollView>
        </>
      )}

      <View style={commonStyles.row}>
        <Button
          text="Annuler"
          onPress={handleClose}
          style={[buttonStyles.secondary, { flex: 1, marginRight: 10 }]}
        />
        <Button
          text="Créer"
          onPress={handleCreateProduct}
          style={[buttonStyles.success, { flex: 1, marginLeft: 10 }]}
          textStyle={{ color: colors.background }}
        />
      </View>
    </ScrollView>
  );

  const renderCategoryForm = () => (
    <View>
      <Text style={commonStyles.title}>Nouvelle catégorie</Text>

      <TextInput
        style={commonStyles.input}
        placeholder="Nom de la catégorie"
        value={newCategoryName}
        onChangeText={setNewCategoryName}
        autoFocus
      />

      <View style={commonStyles.row}>
        <Button
          text="Annuler"
          onPress={() => setStep('product')}
          style={[buttonStyles.secondary, { flex: 1, marginRight: 10 }]}
        />
        <Button
          text="Créer"
          onPress={handleCreateCategory}
          style={[buttonStyles.primary, { flex: 1, marginLeft: 10 }]}
          textStyle={{ color: colors.background }}
        />
      </View>
    </View>
  );

  const renderSubcategoryForm = () => (
    <View>
      <Text style={commonStyles.title}>Nouvelle sous-catégorie</Text>
      <Text style={commonStyles.textSecondary}>
        Catégorie: {categories.find(c => c.id === selectedCategoryId)?.name}
      </Text>

      <TextInput
        style={commonStyles.input}
        placeholder="Nom de la sous-catégorie"
        value={newSubcategoryName}
        onChangeText={setNewSubcategoryName}
        autoFocus
      />

      <View style={commonStyles.row}>
        <Button
          text="Annuler"
          onPress={() => setStep('product')}
          style={[buttonStyles.secondary, { flex: 1, marginRight: 10 }]}
        />
        <Button
          text="Créer"
          onPress={handleCreateSubcategory}
          style={[buttonStyles.primary, { flex: 1, marginLeft: 10 }]}
          textStyle={{ color: colors.background }}
        />
      </View>
    </View>
  );

  return (
    <SimpleBottomSheet isVisible={isVisible} onClose={handleClose}>
      {step === 'product' && renderProductForm()}
      {step === 'category' && renderCategoryForm()}
      {step === 'subcategory' && renderSubcategoryForm()}
    </SimpleBottomSheet>
  );
}
