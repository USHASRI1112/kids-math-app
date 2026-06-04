import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  title: string;
  emoji?: string;
  onPress?: () => void;
}

export default function TopicCard({ title, emoji, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} accessibilityRole="button" activeOpacity={0.9}>
      <LinearGradient colors={['#FFF8FC', '#FFFFFF']} style={styles.gradient}>
        <View style={styles.topBubble} />
        <View style={styles.emojiWrap}>
          <Text style={styles.emoji}>{emoji || '🔢'}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Tap to play</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    minWidth: 140,
    maxWidth: 220,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFD2EA',
    shadowColor: '#D84E9A',
    shadowOpacity: 0.11,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBubble: {
    position: 'absolute',
    top: -24,
    right: -18,
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#FFF2FA',
  },
  emojiWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF2FA',
    borderWidth: 2,
    borderColor: '#FFD2EA',
    marginBottom: 10,
  },
  emoji: { fontSize: 32 },
  title: { fontSize: 18, fontWeight: '900', textAlign: 'center', color: '#7E2D6A' },
  subtitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '800',
    color: '#FF6B9E',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
