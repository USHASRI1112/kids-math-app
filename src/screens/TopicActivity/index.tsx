import React, { useLayoutEffect } from 'react';
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import ActivityCard from '../../components/ActivityCard';
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
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1,
  },
});