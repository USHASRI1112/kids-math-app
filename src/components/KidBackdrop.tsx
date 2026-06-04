import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function KidBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.orb, styles.orbTopLeft]} />
      <View style={[styles.orb, styles.orbTopRight]} />
      <View style={[styles.orb, styles.orbMidLeft]} />
      <View style={[styles.orb, styles.orbBottomRight]} />
      <View style={styles.cloudBand} />
      <View style={styles.sparkle1} />
      <View style={styles.sparkle2} />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.25,
  },
  orbTopLeft: {
    width: 132,
    height: 132,
    backgroundColor: '#FFD36E',
    top: -42,
    left: -26,
  },
  orbTopRight: {
    width: 170,
    height: 170,
    backgroundColor: '#FF9FD4',
    top: -54,
    right: -62,
  },
  orbMidLeft: {
    width: 112,
    height: 112,
    backgroundColor: '#92E7E0',
    top: 220,
    left: -44,
  },
  orbBottomRight: {
    width: 180,
    height: 180,
    backgroundColor: '#A7C7FF',
    bottom: -72,
    right: -72,
  },
  cloudBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: '#FFF2FA',
    opacity: 0.7,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  sparkle1: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    top: 88,
    right: 88,
    opacity: 0.9,
  },
  sparkle2: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    top: 212,
    left: 38,
    opacity: 0.8,
  },
});
