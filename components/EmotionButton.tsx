import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Emotion } from '../constants/emotions';

interface Props {
  emotion: Emotion;
  selected: boolean;
  onPress: (emotion: Emotion) => void;
  disabled?: boolean;
}

export function EmotionButton({ emotion, selected, onPress, disabled }: Props) {
  const scale = useSharedValue(1);
  const rippleOpacity = useSharedValue(0);
  const rippleScale = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : 1,
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: rippleOpacity.value,
    transform: [{ scale: rippleScale.value }],
  }));

  const handlePress = useCallback(async () => {
    if (disabled) return;

    // リップルアニメーション
    rippleOpacity.value = 0.4;
    rippleScale.value = 0;
    rippleOpacity.value = withTiming(0, { duration: 600 });
    rippleScale.value = withTiming(2.5, { duration: 600 });

    // スケールアニメーション
    scale.value = withSequence(
      withSpring(1.18, { damping: 6, stiffness: 200 }),
      withSpring(1.0, { damping: 10, stiffness: 300 }),
    );

    // ハプティクス
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    onPress(emotion);
  }, [disabled, emotion, onPress, rippleOpacity, rippleScale, scale]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`気分: ${emotion.label}`}
      accessibilityState={{ selected }}
      style={styles.wrapper}
    >
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: emotion.color },
          selected && styles.selected,
          animStyle,
        ]}
      >
        {/* リップルエフェクト */}
        <Animated.View
          style={[
            styles.ripple,
            { backgroundColor: emotion.textColor === '#FFFFFF' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.15)' },
            rippleStyle,
          ]}
          pointerEvents="none"
        />
        <View style={styles.inner}>
          <Text
            style={[styles.label, { color: emotion.textColor }]}
            numberOfLines={2}
            accessibilityElementsHidden
          >
            {emotion.label}
          </Text>
        </View>
        {selected && (
          <View style={[styles.checkmark, { borderColor: emotion.textColor }]}>
            <Text style={[styles.checkmarkText, { color: emotion.textColor }]}>v</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 88,
    height: 88,
    margin: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  button: {
    width: 88,
    height: 88,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  selected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  ripple: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 15,
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 10,
    fontWeight: '900',
  },
});
