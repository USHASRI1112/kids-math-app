import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import useLanguage from '../hooks/useLanguage';

export default function LanguageSelector() {
  const { t } = useTranslation();
  const { language, setLanguage, availableLanguages } = useLanguage();

  return (
    <View style={styles.container} accessible accessibilityRole="radiogroup">
      <Text style={styles.label}>{t('app.select_language')}</Text>
      <View style={styles.buttons}>
        {availableLanguages.map((lng) => (
          <TouchableOpacity
            key={lng}
            style={[styles.button, language === lng && styles.active]}
            onPress={() => setLanguage(lng)}
            accessibilityRole="radio"
            accessibilityState={{ selected: language === lng }}
          >
            <Text style={styles.buttonText}>{lng.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16, alignItems: 'center' },
  label: { fontSize: 18, marginBottom: 8 },
  buttons: { flexDirection: 'row', gap: 8 },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  active: { backgroundColor: '#005BBB' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
