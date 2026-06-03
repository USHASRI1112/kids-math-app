import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { initI18n } from './src/i18n';
import LanguageSelector from './src/components/LanguageSelector';

export default function App() {
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initI18n();
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('app.welcome')}</Text>
      <Text style={styles.paragraph}>{t('app.open_prompt')}</Text>
      <LanguageSelector />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  paragraph: { fontSize: 16, textAlign: 'center', marginBottom: 16 },
});
