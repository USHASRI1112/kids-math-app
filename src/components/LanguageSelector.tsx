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
  iconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFD2EA',
  },
  icon: { fontSize: 22 },
  backdrop: { flex: 1, backgroundColor: 'rgba(255, 102, 158, 0.24)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '60%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 16,
    borderTopWidth: 2,
    borderColor: '#FFD2EA',
  },
  sheetTitle: { fontSize: 20, fontWeight: '900', marginBottom: 10, color: '#7E2D6A' },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 18,
    marginBottom: 8,
    backgroundColor: '#FFF8FC',
    borderWidth: 2,
    borderColor: '#FFD2EA',
  },
  selectedItem: { backgroundColor: '#FFF2FA' },
  itemLabel: { fontSize: 16, fontWeight: '800', color: '#7E2D6A' },
  itemCode: { fontSize: 12, color: '#FF6B9E', fontWeight: '800' },
});
