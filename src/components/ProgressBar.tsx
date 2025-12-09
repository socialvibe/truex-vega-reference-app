import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime } from '../csai/utils';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
}

export function ProgressBar({ currentTime, duration }: ProgressBarProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 60,
    right: 60,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeText: {
    color: 'white',
    fontSize: 24,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'white',
  },
});
