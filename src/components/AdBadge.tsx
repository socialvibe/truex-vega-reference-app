import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AdBadgeProps {
  adIndex: number;
  countdown: number;
}

export function AdBadge({ adIndex, countdown }: AdBadgeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        #{adIndex} :{countdown}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  text: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
});
