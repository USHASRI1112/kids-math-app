import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  title: string;
  icon: string;
  onPress: () => void;
}

export default function ActivityCard({ title, icon, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <LinearGradient colors={['#FFFFFF', '#FFF2FA']} style={styles.gradient}>
        <View style={styles.sparkle} />
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name={icon as never} size={28} color="#FF6B9E" />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Let’s go</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    minHeight: 138,
    borderRadius: 26,
    shadowColor: '#D84E9A',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FFD2EA',
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 138,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: '#FFF2FA',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF2FA',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FFD2EA',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#7E2D6A',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    color: '#FF6B9E',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sparkle: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFE39A',
  },
});
