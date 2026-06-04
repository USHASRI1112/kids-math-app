import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function PremiumModal({ visible, onClose }: Props) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.bubble}>💎</Text>
          <Text style={styles.title}>{t('topics.premium_title')}</Text>
          <Text style={styles.body}>{t('topics.premium_body')}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose} accessibilityRole="button">
            <Text style={styles.buttonText}>{t('app.close', { defaultValue: 'Close' })}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(255, 102, 158, 0.24)', justifyContent: 'center', alignItems: 'center' },
  container: {
    width: '84%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD2EA',
    shadowColor: '#D84E9A',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  bubble: { fontSize: 36, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '900', marginBottom: 8, color: '#7E2D6A' },
  body: { fontSize: 15, color: '#704D66', marginBottom: 18, textAlign: 'center', lineHeight: 22 },
  button: { backgroundColor: '#FF6B9E', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999 },
  buttonText: { color: '#fff', fontWeight: '900' },
});
