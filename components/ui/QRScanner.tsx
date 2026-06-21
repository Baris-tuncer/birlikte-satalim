import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Modal } from 'react-native';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/Theme';

interface QRScannerProps {
  visible: boolean;
  onScanned: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ visible, onScanned, onClose }: QRScannerProps) {
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScanned(data);
  };

  const handleClose = () => {
    setScanned(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          {/* Overlay */}
          <View style={styles.overlay}>
            {/* Top bar */}
            <View style={styles.topBar}>
              <Pressable style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={28} color="#fff" />
              </Pressable>
              <Text style={styles.title}>QR Kod Okut</Text>
              <View style={{ width: 44 }} />
            </View>

            {/* Scan frame */}
            <View style={styles.scanArea}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructions}>
              <Text style={styles.instructionText}>
                Yetki belgesindeki QR kodu kameraya gösterin
              </Text>
              {scanned && (
                <Pressable
                  style={styles.rescanButton}
                  onPress={() => setScanned(false)}
                >
                  <Text style={styles.rescanText}>Tekrar Tara</Text>
                </Pressable>
              )}
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const CORNER_SIZE = 24;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...Typography.headline,
    color: '#fff',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: Colors.accent,
    borderTopLeftRadius: Radius.sm,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: Colors.accent,
    borderTopRightRadius: Radius.sm,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: Colors.accent,
    borderBottomLeftRadius: Radius.sm,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: Colors.accent,
    borderBottomRightRadius: Radius.sm,
  },
  instructions: {
    alignItems: 'center',
    paddingBottom: 80,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  instructionText: {
    ...Typography.subhead,
    color: '#fff',
    textAlign: 'center',
  },
  rescanButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  rescanText: {
    ...Typography.subhead,
    color: '#fff',
    fontWeight: '600',
  },
});
