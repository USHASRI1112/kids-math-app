import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AdditionLearnEngine from '../../components/addition/AdditionLearnEngine';
import AdditionPracticeModule from '../../components/addition/AdditionPracticeModule';
import AdditionQuizModule from '../../components/addition/AdditionQuizModule';
import AdditionTestModule from '../../components/addition/AdditionTestModule';
import AdditionTimerModule from '../../components/addition/AdditionTimerModule';
import SubtractionLearnEngine from '../../components/subtraction/SubtractionLearnEngine';
import SubtractionPracticeModule from '../../components/subtraction/SubtractionPracticeModule';
import SubtractionTestModule from '../../components/subtraction/SubtractionTestModule';
import SubtractionQuizModule from '../../components/subtraction/SubtractionQuizModule';
import SubtractionTimerModule from '../../components/subtraction/SubtractionTimerModule';
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
      ) : topicKey === 'subtraction' && activityKey === 'learn' ? (
        <SubtractionLearnEngine />
      ) : topicKey === 'addition' && activityKey === 'quiz' ? (
        <AdditionQuizModule />
      ) : topicKey === 'subtraction' && activityKey === 'quiz' ? (
        <SubtractionQuizModule />
      ) : topicKey === 'addition' && activityKey === 'timer' ? (
        <AdditionTimerModule />
      ) : topicKey === 'subtraction' && activityKey === 'timer' ? (
        <SubtractionTimerModule />
      ) : topicKey === 'addition' && activityKey === 'test' ? (
        <AdditionTestModule />
      ) : topicKey === 'subtraction' && activityKey === 'test' ? (
        <SubtractionTestModule />
      ) : topicKey === 'addition' && activityKey === 'practice' ? (
        <AdditionPracticeModule />
      ) : topicKey === 'subtraction' && activityKey === 'practice' ? (
        <SubtractionPracticeModule />
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
