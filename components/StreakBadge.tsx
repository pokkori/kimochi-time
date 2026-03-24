import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/colors';

interface Props {
  streak: number;
  size?: 'small' | 'medium' | 'large';
}

function FlameSVG({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C12 2 8 6 8 10C8 12.5 9.5 14.5 11 15.5C10.5 14 11 12.5 12 11.5C13 12.5 13.5 14 13 15.5C14.5 14.5 16 12.5 16 10C16 6 12 2 12 2Z"
        fill={color}
      />
      <Path
        d="M12 22C14.761 22 17 19.761 17 17C17 14.8 15.5 13 14 12C14.5 13.5 14 15 13 16C12.5 14.5 11.5 13.5 11 12C9.5 13 8 14.8 8 17C8 19.761 10.239 22 12 22Z"
        fill={color}
        opacity={0.8}
      />
    </Svg>
  );
}

export function StreakBadge({ streak, size = 'medium' }: Props) {
  const config = {
    small:  { iconSize: 18, fontSize: 13, padding: 6 },
    medium: { iconSize: 24, fontSize: 16, padding: 8 },
    large:  { iconSize: 32, fontSize: 22, padding: 12 },
  }[size];

  const color = streak >= 30 ? '#FF4500' : streak >= 7 ? Colors.streakOrange : Colors.secondary;

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`連続送信${streak}日`}
    >
      <FlameSVG color={color} size={config.iconSize} />
      <Text style={[styles.count, { fontSize: config.fontSize, color }]}>{streak}</Text>
      <Text style={[styles.unit, { color }]}>日</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  count: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
