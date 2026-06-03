import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  emoji?: string;
  onPress?: () => void;
}

export default function TopicCard({ title, emoji, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} accessibilityRole="button" activeOpacity={0.85}>
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>{emoji || '🔢'}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    minWidth: 140,
    maxWidth: 220,
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  emojiWrap: { marginBottom: 8 },
  emoji: { fontSize: 28 },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
});
