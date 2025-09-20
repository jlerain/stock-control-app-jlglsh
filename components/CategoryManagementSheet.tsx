
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import SimpleBottomSheet from './BottomSheet';
import Button from './Button';
import Icon from './Icon';
import { Category, Subcategory } from '../types';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';

interface CategoryManagementSheetProps {
  isVisible: boolean;
  onClose: () => void;
  categories: Category[];
  subcategories: Subcategory[];
  onAddCategory: (name: string) => Promise<Category>;
  onUpdateCategory: (categoryId: string, name: string) => Promise<void>;
  onRemoveCategory: (categoryId: string) => Promise<void>;
  onAddSubcategory: (name: string, categoryId: string) => Promise<Subcategory>;
  onUpdateSubcategory: (subcategoryId: string, name: string) => Promise<void>;
  onRemoveSubcategory: (subcategoryId: string) => Promise<void>;
}

type ViewMode = 'list' | 'addCategory' | 'editCategory' | 'addSubcategory' | 'editSubcategory';

export default function CategoryManagementSheet({
  isVisible,
  onClose,
  categories,
  subcategories,
  onAddCategory,
  onUpdateCategory,
  onRemoveCategory,
  onAddSubcategory,
  onUpdateSubcategory,
  onRemoveSubcategory,
}: CategoryManagementSheetProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [categoryName, setCategoryName] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isVisible) {
      resetForm();
    }
  }, [isVisible]);

  const resetForm = () => {
    setViewMode('list');
    setCategoryName('');
    setSubcategoryName('');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom de catégorie');
      return;
    }

    try {
      await onAddCategory(categoryName.trim());
      Alert.alert('Succès', 'Catégorie ajoutée avec succès');
      resetForm();
    } catch (error) {
      console.log('Error adding category:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter la catégorie');
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory || !categoryName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom de catégorie');
      return;
    }

    try {
      await onUpdateCategory(selectedCategory.id, categoryName.trim());
      Alert.alert('Succès', 'Catégorie modifiée avec succès');
      resetForm();
    } catch (error) {
      console.log('Error updating category:', error);
      Alert.alert('Erreur', 'Impossible de modifier la catégorie');
    }
  };

  const handleRemoveCategory = async (category: Category) => {
    const categorySubcategories = subcategories.filter(sub => sub.categoryId === category.id);
    const message = categorySubcategories.length > 0
      ? `Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ? Cela supprimera également ${categorySubcategories.length} sous-catégorie(s) et tous les produits associés.`
      : `Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`;

    Alert.alert(
      'Confirmer la suppression',
      message,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await onRemoveCategory(category.id);
              Alert.alert('Succès', 'Catégorie supprimée avec succès');
            } catch (error) {
              console.log('Error removing category:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la catégorie');
            }
          },
        },
      ]
    );
  };

  const handleAddSubcategory = async () => {
    if (!selectedCategory || !subcategoryName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom de sous-catégorie');
      return;
    }

    try {
      await onAddSubcategory(subcategoryName.trim(), selectedCategory.id);
      Alert.alert('Succès', 'Sous-catégorie ajoutée avec succès');
      resetForm();
    } catch (error) {
      console.log('Error adding subcategory:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter la sous-catégorie');
    }
  };

  const handleUpdateSubcategory = async () => {
    if (!selectedSubcategory || !subcategoryName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom de sous-catégorie');
      return;
    }

    try {
      await onUpdateSubcategory(selectedSubcategory.id, subcategoryName.trim());
      Alert.alert('Succès', 'Sous-catégorie modifiée avec succès');
      resetForm();
    } catch (error) {
      console.log('Error updating subcategory:', error);
      Alert.alert('Erreur', 'Impossible de modifier la sous-catégorie');
    }
  };

  const handleRemoveSubcategory = async (subcategory: Subcategory) => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer la sous-catégorie "${subcategory.name}" ? Cela supprimera également tous les produits associés.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await onRemoveSubcategory(subcategory.id);
              Alert.alert('Succès', 'Sous-catégorie supprimée avec succès');
            } catch (error) {
              console.log('Error removing subcategory:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la sous-catégorie');
            }
          },
        },
      ]
    );
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderListView = () => (
    <View style={{ flex: 1 }}>
      <View style={[commonStyles.row, { marginBottom: 20 }]}>
        <Text style={commonStyles.title}>Gestion des catégories</Text>
        <TouchableOpacity
          onPress={() => setViewMode('addCategory')}
          style={[buttonStyles.primary, { paddingHorizontal: 16, paddingVertical: 8 }]}
        >
          <Icon name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {categories.map(category => {
          const categorySubcategories = subcategories.filter(sub => sub.categoryId === category.id);
          const isExpanded = expandedCategories.has(category.id);

          return (
            <View key={category.id} style={commonStyles.card}>
              <View style={commonStyles.row}>
                <TouchableOpacity
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => toggleCategoryExpansion(category.id)}
                >
                  <Icon
                    name={isExpanded ? "chevron-down" : "chevron-forward"}
                    size={20}
                    color={colors.text}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[commonStyles.subtitle, { flex: 1 }]}>{category.name}</Text>
                </TouchableOpacity>
                
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedCategory(category);
                      setViewMode('addSubcategory');
                    }}
                    style={[buttonStyles.secondary, { paddingHorizontal: 8, paddingVertical: 4 }]}
                  >
                    <Icon name="add" size={16} color={colors.text} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedCategory(category);
                      setCategoryName(category.name);
                      setViewMode('editCategory');
                    }}
                    style={[buttonStyles.secondary, { paddingHorizontal: 8, paddingVertical: 4 }]}
                  >
                    <Icon name="pencil" size={16} color={colors.text} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleRemoveCategory(category)}
                    style={[buttonStyles.error, { paddingHorizontal: 8, paddingVertical: 4 }]}
                  >
                    <Icon name="trash" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {isExpanded && (
                <View style={{ marginTop: 12, marginLeft: 20 }}>
                  {categorySubcategories.length === 0 ? (
                    <Text style={commonStyles.textSecondary}>Aucune sous-catégorie</Text>
                  ) : (
                    categorySubcategories.map(subcategory => (
                      <View key={subcategory.id} style={[commonStyles.row, { marginBottom: 8 }]}>
                        <Text style={[commonStyles.text, { flex: 1 }]}>{subcategory.name}</Text>
                        
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedSubcategory(subcategory);
                              setSubcategoryName(subcategory.name);
                              setViewMode('editSubcategory');
                            }}
                            style={[buttonStyles.secondary, { paddingHorizontal: 6, paddingVertical: 2 }]}
                          >
                            <Icon name="pencil" size={14} color={colors.text} />
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            onPress={() => handleRemoveSubcategory(subcategory)}
                            style={[buttonStyles.error, { paddingHorizontal: 6, paddingVertical: 2 }]}
                          >
                            <Icon name="trash" size={14} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          );
        })}

        {categories.length === 0 && (
          <View style={[commonStyles.card, commonStyles.centerContent]}>
            <Text style={commonStyles.textSecondary}>Aucune catégorie créée</Text>
            <Text style={commonStyles.textSecondary}>Appuyez sur + pour ajouter une catégorie</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderAddCategoryForm = () => (
    <View style={{ flex: 1 }}>
      <Text style={commonStyles.title}>Ajouter une catégorie</Text>
      
      <TextInput
        style={commonStyles.input}
        placeholder="Nom de la catégorie"
        value={categoryName}
        onChangeText={setCategoryName}
        autoFocus
      />

      <View style={[commonStyles.row, { marginTop: 20 }]}>
        <Button
          text="Annuler"
          onPress={() => setViewMode('list')}
          style={[buttonStyles.secondary, { flex: 1, marginRight: 10 }]}
          textStyle={{ color: colors.text }}
        />
        <Button
          text="Ajouter"
          onPress={handleAddCategory}
          style={[buttonStyles.primary, { flex: 1, marginLeft: 10 }]}
          textStyle={{ color: 'white' }}
        />
      </View>
    </View>
  );

  const renderEditCategoryForm = () => (
    <View style={{ flex: 1 }}>
      <Text style={commonStyles.title}>Modifier la catégorie</Text>
      
      <TextInput
        style={commonStyles.input}
        placeholder="Nom de la catégorie"
        value={categoryName}
        onChangeText={setCategoryName}
        autoFocus
      />

      <View style={[commonStyles.row, { marginTop: 20 }]}>
        <Button
          text="Annuler"
          onPress={() => setViewMode('list')}
          style={[buttonStyles.secondary, { flex: 1, marginRight: 10 }]}
          textStyle={{ color: colors.text }}
        />
        <Button
          text="Modifier"
          onPress={handleUpdateCategory}
          style={[buttonStyles.primary, { flex: 1, marginLeft: 10 }]}
          textStyle={{ color: 'white' }}
        />
      </View>
    </View>
  );

  const renderAddSubcategoryForm = () => (
    <View style={{ flex: 1 }}>
      <Text style={commonStyles.title}>Ajouter une sous-catégorie</Text>
      <Text style={commonStyles.textSecondary}>
        Catégorie: {selectedCategory?.name}
      </Text>
      
      <TextInput
        style={commonStyles.input}
        placeholder="Nom de la sous-catégorie"
        value={subcategoryName}
        onChangeText={setSubcategoryName}
        autoFocus
      />

      <View style={[commonStyles.row, { marginTop: 20 }]}>
        <Button
          text="Annuler"
          onPress={() => setViewMode('list')}
          style={[buttonStyles.secondary, { flex: 1, marginRight: 10 }]}
          textStyle={{ color: colors.text }}
        />
        <Button
          text="Ajouter"
          onPress={handleAddSubcategory}
          style={[buttonStyles.primary, { flex: 1, marginLeft: 10 }]}
          textStyle={{ color: 'white' }}
        />
      </View>
    </View>
  );

  const renderEditSubcategoryForm = () => (
    <View style={{ flex: 1 }}>
      <Text style={commonStyles.title}>Modifier la sous-catégorie</Text>
      
      <TextInput
        style={commonStyles.input}
        placeholder="Nom de la sous-catégorie"
        value={subcategoryName}
        onChangeText={setSubcategoryName}
        autoFocus
      />

      <View style={[commonStyles.row, { marginTop: 20 }]}>
        <Button
          text="Annuler"
          onPress={() => setViewMode('list')}
          style={[buttonStyles.secondary, { flex: 1, marginRight: 10 }]}
          textStyle={{ color: colors.text }}
        />
        <Button
          text="Modifier"
          onPress={handleUpdateSubcategory}
          style={[buttonStyles.primary, { flex: 1, marginLeft: 10 }]}
          textStyle={{ color: 'white' }}
        />
      </View>
    </View>
  );

  const renderContent = () => {
    switch (viewMode) {
      case 'addCategory':
        return renderAddCategoryForm();
      case 'editCategory':
        return renderEditCategoryForm();
      case 'addSubcategory':
        return renderAddSubcategoryForm();
      case 'editSubcategory':
        return renderEditSubcategoryForm();
      default:
        return renderListView();
    }
  };

  return (
    <SimpleBottomSheet isVisible={isVisible} onClose={handleClose}>
      <View style={{ padding: 20, minHeight: 400, maxHeight: '80%' }}>
        {renderContent()}
      </View>
    </SimpleBottomSheet>
  );
}
