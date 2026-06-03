import React, { useLayoutEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import AdditionLearnEngine from '../../components/AdditionLearnEngine';
import { RootStackParamList } from '../../navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'ActivityDetail'>;

export default function ActivityDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute();
  const { t } = useTranslation();
  const { topicKey, activityKey } = route.params as RootStackParamList['ActivityDetail'];

  const topicTitle = t(`topics.${topicKey}`);
  const activityTitleMap: Record<RootStackParamList['ActivityDetail']['activityKey'], string> = {
    learn: t('activities.learn'),
    practice: t('activities.practice'),
    quiz: t('activities.quiz'),
    timer: t('activities.timer'),
    test: t('activities.test'),
    play: t('activities.play'),
  };
  const activityTitle = activityTitleMap[activityKey];

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${topicTitle} - ${activityTitle}`,
      headerTitleAlign: 'center',
    });
  }, [navigation, topicTitle, activityTitle]);

  return (
    <SafeAreaView style={styles.safe}>
      {topicKey === 'addition' && activityKey === 'learn' ? (
        <AdditionLearnEngine />
      ) : (
        <View style={styles.container}>
          <Text style={styles.title}>{`${topicTitle} - ${activityTitle}`}</Text>
          <Text style={styles.body}>{t('activities.coming_soon')}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#16336C',
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 18,
    color: '#4A5A78',
    textAlign: 'center',
  },
});
