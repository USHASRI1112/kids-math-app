import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopicCard from '../../components/TopicCard';
import PremiumModal from '../../components/PremiumModal';
import LanguageSelector from '../../components/LanguageSelector';
import KidBackdrop from '../../components/KidBackdrop';
import { useTranslation } from 'react-i18next';
import { TOPICS } from '../../data/navigation';
import { RootStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function Home() {
  const navigation = useNavigation<Navigation>();
  const { t } = useTranslation();
  const [premiumVisible, setPremiumVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <KidBackdrop />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity accessibilityRole="button" style={styles.avatarBtn}>
            <Text style={styles.avatarIcon}>👧</Text>
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

        <View style={styles.heroCard}>
          <Text style={styles.heroKicker}>Candy Bubble Wonder</Text>
          <Text style={styles.heroTitle}>{t('app.welcome')}</Text>
          <Text style={styles.heroBody}>Pick a sparkling topic and start playing with numbers.</Text>
          <View style={styles.heroPills}>
            <View style={styles.heroPill}><Text style={styles.heroPillText}>Stars</Text></View>
            <View style={styles.heroPill}><Text style={styles.heroPillText}>Bubbles</Text></View>
            <View style={styles.heroPill}><Text style={styles.heroPillText}>Toys</Text></View>
          </View>
        </View>

        <FlatList
          data={TOPICS}
          keyExtractor={(item) => item.key}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.col}>
              <TopicCard
                title={t(`topics.${item.key}`)}
                emoji={item.emoji}
                onPress={() => navigation.navigate('TopicActivity', { topicKey: item.key })}
              />
            </View>
          )}
        />
      </ScrollView>

      <PremiumModal visible={premiumVisible} onClose={() => setPremiumVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8FC' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 28 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 14,
  },
  topRight: { flexDirection: 'row', alignItems: 'center' },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFD8EE',
  },
  avatarIcon: { fontSize: 20 },
  icon: { fontSize: 22, marginHorizontal: 8 },
  iconBtn: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFD8EE',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFD2EA',
    shadowColor: '#D84E9A',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    marginBottom: 16,
  },
  heroKicker: {
    color: '#FF6B9E',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#7E2D6A',
    marginTop: 8,
  },
  heroBody: {
    marginTop: 8,
    color: '#704D66',
    fontSize: 16,
    lineHeight: 22,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  heroPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFF2FA',
    borderWidth: 2,
    borderColor: '#FFD2EA',
  },
  heroPillText: {
    color: '#8B3E74',
    fontWeight: '800',
  },
  list: { paddingBottom: 10 },
  col: { flex: 1, paddingHorizontal: 4 },
});
