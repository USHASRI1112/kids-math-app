import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import TopicCard from '../../components/TopicCard';
import PremiumModal from '../../components/PremiumModal';
import LanguageSelector from '../../components/LanguageSelector';
import { useTranslation } from 'react-i18next';

const TOPICS = [
  { key: 'addition', title: 'Addition', emoji: '➕' },
  { key: 'subtraction', title: 'Subtraction', emoji: '➖' },
  { key: 'multiplication', title: 'Multiplication', emoji: '✖️' },
  { key: 'division', title: 'Division', emoji: '➗' },
  { key: 'decimal', title: 'Decimal Operation', emoji: '🔢' },
  { key: 'fractions', title: 'Fractions', emoji: '🥧' },
  { key: 'percentages', title: 'Percentages', emoji: '📊' },
  { key: 'roots', title: 'Roots', emoji: '√' },
];

export default function Home() {
  const { t } = useTranslation();
  const [premiumVisible, setPremiumVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity accessibilityRole="button">
          <Text style={styles.icon}>👤</Text>
        </TouchableOpacity>
        <View style={styles.topRight}>
          <LanguageSelector />
          <TouchableOpacity onPress={() => setPremiumVisible(true)} style={styles.iconBtn} accessibilityRole="button">
            <Text style={styles.icon}>💎</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" style={styles.iconBtn}>
            <Text style={styles.icon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={TOPICS}
        keyExtractor={(item) => item.key}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.col}>
            <TopicCard title={t(`topics.${item.key}`)} emoji={item.emoji} />
          </View>
        )}
      />

      <PremiumModal visible={premiumVisible} onClose={() => setPremiumVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  topRight: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 22, marginHorizontal: 8 },
  iconBtn: { marginLeft: 8 },
  list: { paddingHorizontal: 8, paddingBottom: 24 },
  col: { flex: 1, paddingHorizontal: 4 },
});
