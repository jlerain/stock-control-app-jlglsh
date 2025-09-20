
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';

interface ScannerProps {
  onBarCodeScanned: (barcode: string) => void;
  onClose: () => void;
}

export default function Scanner({ onBarCodeScanned, onClose }: ScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    console.log('Barcode scanned:', data);
    onBarCodeScanned(data);
  };

  const resetScanner = () => {
    setScanned(false);
  };

  if (hasPermission === null) {
    return (
      <View style={[commonStyles.container, commonStyles.centerContent]}>
        <Text style={commonStyles.text}>Demande d&apos;autorisation pour la caméra...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[commonStyles.container, commonStyles.centerContent]}>
        <Text style={commonStyles.text}>Pas d&apos;accès à la caméra</Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={commonStyles.scannerContainer}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={commonStyles.scannerOverlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={colors.background} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.scanArea}>
          <View style={commonStyles.scannerFrame} />
          <Text style={styles.instructionText}>
            Placez le code-barre dans le cadre
          </Text>
        </View>

        {scanned && (
          <View style={styles.bottomActions}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={resetScanner}
            >
              <Text style={styles.buttonText}>Scanner à nouveau</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  scanArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    color: colors.background,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
