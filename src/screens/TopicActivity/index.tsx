import React, { useLayoutEffect } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import ActivityCard from '../../components/ActivityCard';
import KidBackdrop from '../../components/KidBackdrop';
import { ACTIVITIES } from '../../data/navigation';
import { RootStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'TopicActivity'>;

export default function TopicActivityScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute();
  const { t } = useTranslation();
  const { topicKey } = route.params as RootStackParamList['TopicActivity'];
  const topicTitle = t(`topics.${topicKey}`);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: topicTitle,
      headerTitleAlign: 'center',
    });
  }, [navigation, topicTitle]);

  return (
    <SafeAreaView style={styles.safe}>
      <KidBackdrop />
      <View style={styles.headerCard}>
        <Text style={styles.topicLabel}>{t('activities.play')}</Text>
        <Text style={styles.topicTitle}>{topicTitle}</Text>
        <Text style={styles.topicBody}>Choose a bubbly activity to start playing.</Text>
      </View>
      <FlatList
        data={ACTIVITIES}
        keyExtractor={(item) => item.key}
        numColumns={2}
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <ActivityCard
              title={t(item.titleKey)}
              icon={item.icon}
              onPress={() =>
                navigation.navigate('ActivityDetail', {
                  topicKey,
                  activityKey: item.key,
                })
              }
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFF8FC',
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 18,
    borderWidth: 2,
    borderColor: '#FFD2EA',
    shadowColor: '#D84E9A',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  topicLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FF6B9E',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  topicTitle: {
    marginTop: 6,
    fontSize: 30,
    fontWeight: '900',
    color: '#7E2D6A',
  },
  topicBody: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: '#704D66',
  },
  content: {
    paddingHorizontal: 8,
    paddingVertical: 16,
    paddingBottom: 28,
  },
  row: {
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1,
  },
});
