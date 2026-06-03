import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import useLanguage from '../hooks/useLanguage';

const FULL_LANGUAGES: { code: string; label: string; icon: string }[] = [
  { code: 'en', label: 'English', icon: '🇺🇸' },
  { code: 'es', label: 'Español', icon: '🇪🇸' },
  { code: 'pt', label: 'Português', icon: '🇵🇹' },
  { code: 'de', label: 'Deutsch', icon: '🇩🇪' },
  { code: 'it', label: 'Italiano', icon: '🇮🇹' },
  { code: 'fr', label: 'Français', icon: '🇫🇷' },
  { code: 'ru', label: 'Русский', icon: '🇷🇺' },
  { code: 'id', label: 'Bahasa Indonesia', icon: '🇮🇩' },
  { code: 'ms', label: 'Melayu', icon: '🇲🇾' },
  { code: 'hi', label: 'हिन्दी', icon: '🇮🇳' },
  { code: 'ko', label: '한국어', icon: '🇰🇷' },
];

export default function LanguageSelector() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [visible, setVisible] = useState(false);

  function select(lang: string) {
    setLanguage(lang);
    setVisible(false);
  }

  const currentLanguage = language.split('-')[0].toLowerCase();
  const selected = FULL_LANGUAGES.find((l) => l.code === currentLanguage) || FULL_LANGUAGES[0];

  return (
    <View>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={t('app.select_language')}
        style={styles.iconBtn}
      >
        <Text style={styles.icon}>{selected.icon}</Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
        <View style={styles.sheet} accessibilityRole="menu">
          <Text style={styles.sheetTitle}>{t('app.select_language')}</Text>
          <FlatList
            data={FULL_LANGUAGES}
            keyExtractor={(it) => it.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.item, language === item.code && styles.selectedItem]}
                onPress={() => select(item.code)}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: language === item.code }}
              >
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemCode}>{item.code.toUpperCase()}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  iconBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  icon: { fontSize: 22 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '60%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 12,
  },
  sheetTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  item: { paddingVertical: 12, paddingHorizontal: 8, flexDirection: 'row', justifyContent: 'space-between' },
  selectedItem: { backgroundColor: '#eef6ff', borderRadius: 8 },
  itemLabel: { fontSize: 16 },
  itemCode: { fontSize: 12, color: '#666' },
});
