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
          <Text style={styles.title}>{t('topics.premium_title')}</Text>
          <Text style={styles.body}>{t('topics.premium_body')}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose} accessibilityRole="button">
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  body: { fontSize: 14, color: '#444', marginBottom: 16, textAlign: 'center' },
  button: { backgroundColor: '#007AFF', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
