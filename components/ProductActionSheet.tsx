
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Product } from '../types';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import SimpleBottomSheet from './BottomSheet';
import Button from './Button';

interface ProductActionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  product: Product | null;
  onAddQuantity: (quantity: number) => void;
  onRemoveQuantity: (quantity: number) => void;
  onModifyProduct: (product: Product) => void;
}

export default function ProductActionSheet({
  isVisible,
  onClose,
  product,
  onAddQuantity,
  onRemoveQuantity,
  onModifyProduct,
}: ProductActionSheetProps) {
  const [action, setAction] = useState<'menu' | 'add' | 'remove' | 'modify'>('menu');
  const [quantity, setQuantity] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  React.useEffect(() => {
    if (product && isVisible) {
      setName(product.name);
      setDescription(product.description);
      setAction('menu');
      setQuantity('');
    }
  }, [product, isVisible]);

  const handleClose = () => {
    setAction('menu');
    setQuantity('');
    onClose();
  };

  const handleAddQuantity = () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer une quantité valide');
      return;
    }
    onAddQuantity(qty);
    handleClose();
  };

  const handleRemoveQuantity = () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer une quantité valide');
      return;
    }
    if (product && qty > product.quantity) {
      Alert.alert('Erreur', 'Quantité insuffisante en stock');
      return;
    }
    onRemoveQuantity(qty);
    handleClose();
  };

  const handleModifyProduct = () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom du produit est requis');
      return;
    }
    if (!product) return;

    const updatedProduct: Product = {
      ...product,
      name: name.trim(),
      description: description.trim(),
      updatedAt: new Date(),
    };
    onModifyProduct(updatedProduct);
    handleClose();
  };

  if (!product) return null;

  const renderMenu = () => (
    <View>
      <Text style={commonStyles.title}>{product.name}</Text>
      <Text style={commonStyles.textSecondary}>{product.description}</Text>
      <Text style={commonStyles.text}>Stock actuel: {product.quantity}</Text>
      <Text style={commonStyles.textSecondary}>Code-barre: {product.barcode}</Text>

      <View style={{ marginTop: 20 }}>
        <Button
          text="Ajouter du stock"
          onPress={() => setAction('add')}
          style={[buttonStyles.success, { marginBottom: 10 }]}
          textStyle={{ color: colors.background }}
        />
        <Button
          text="Retirer du stock"
          onPress={() => setAction('remove')}
          style={[buttonStyles.warning, { marginBottom: 10 }]}
          textStyle={{ color: colors.background }}
        />
        <Button
          text="Modifier le produit"
          onPress={() => setAction('modify')}
          style={[buttonStyles.primary, { marginBottom: 10 }]}
          textStyle={{ color: colors.background }}
        />
      </View>
    </View>
  );

  const renderQuantityInput = (actionType: 'add' | 'remove') => (
    <View>
      <Text style={commonStyles.title}>
        {actionType === 'add' ? 'Ajouter du stock' : 'Retirer du stock'}
      </Text>
      <Text style={commonStyles.text}>{product.name}</Text>
      <Text style={commonStyles.textSecondary}>Stock actuel: {product.quantity}</Text>

      <TextInput
        style={commonStyles.input}
        placeholder="Quantité"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        autoFocus
      />

      <View style={commonStyles.row}>
        <Button
          text="Annuler"
          onPress={() => setAction('menu')}
          style={[buttonStyles.secondary, { flex: 1, marginRight: 10 }]}
        />
        <Button
          text="Confirmer"
          onPress={actionType === 'add' ? handleAddQuantity : handleRemoveQuantity}
          style={[
            actionType === 'add' ? buttonStyles.success : buttonStyles.warning,
            { flex: 1, marginLeft: 10 }
          ]}
          textStyle={{ color: colors.background }}
        />
      </View>
    </View>
  );

  const renderModifyForm = () => (
    <View>
      <Text style={commonStyles.title}>Modifier le produit</Text>

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

      <View style={commonStyles.row}>
        <Button
          text="Annuler"
          onPress={() => setAction('menu')}
          style={[buttonStyles.secondary, { flex: 1, marginRight: 10 }]}
        />
        <Button
          text="Sauvegarder"
          onPress={handleModifyProduct}
          style={[buttonStyles.primary, { flex: 1, marginLeft: 10 }]}
          textStyle={{ color: colors.background }}
        />
      </View>
    </View>
  );

  return (
    <SimpleBottomSheet isVisible={isVisible} onClose={handleClose}>
      {action === 'menu' && renderMenu()}
      {action === 'add' && renderQuantityInput('add')}
      {action === 'remove' && renderQuantityInput('remove')}
      {action === 'modify' && renderModifyForm()}
    </SimpleBottomSheet>
  );
}
