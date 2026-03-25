/**
 * MoodParticles: 感情選択時のハートパーティクル演出（10個・Reanimated 3 使用）
 * Reanimated 3.10.1 (SDK 51) 対応 - useSharedValue + useAnimatedStyle ベース
 * Easing.linear 禁止 / 絵文字UI禁止
 */
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PARTICLE_COUNT = 10;

interface ParticleConfig {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  delay: number;
}

function generateConfigs(): ParticleConfig[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const startX = SCREEN_W / 2 + (Math.random() - 0.5) * SCREEN_W * 0.6;
    const startY = SCREEN_H * 0.55;
    return {
      startX,
      startY,
      targetX: startX + (Math.random() - 0.5) * 160,
      targetY: startY - 60 - Math.random() * 120,
      delay: i * 30,
    };
  });
}

interface SingleParticleProps {
  config: ParticleConfig;
  color: string;
  visible: boolean;
  onComplete?: () => void;
  isLast: boolean;
}

function SingleParticle({ config, color, visible, onComplete, isLast }: SingleParticleProps) {
  const translateX = useSharedValue(config.startX);
  const translateY = useSharedValue(config.startY);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      translateX.value = config.startX;
      translateY.value = config.startY;
      opacity.value = 0;
      scale.value = 0;
      return;
    }

    // リセット
    translateX.value = config.startX;
    translateY.value = config.startY;
    opacity.value = 0;
    scale.value = 0;

    // 遅延後にアニメーション開始
    opacity.value = withDelay(
      config.delay,
      withSequence(
        withTiming(0.9, { duration: 180 }),
        withTiming(0, { duration: 300 }),
      ),
    );

    scale.value = withDelay(
      config.delay,
      withSpring(0.6 + Math.random() * 0.6, { damping: 8, stiffness: 300 }),
    );

    translateY.value = withDelay(
      config.delay,
      withTiming(config.targetY, { duration: 900 }),
    );

    translateX.value = withDelay(
      config.delay,
      withTiming(config.targetX, { duration: 900 }, (finished) => {
        if (finished && isLast && onComplete) {
          runOnJS(onComplete)();
        }
      }),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.particle, { backgroundColor: color }, animStyle]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}

interface Props {
  color: string;
  visible: boolean;
  onComplete?: () => void;
}

export function MoodParticles({ color, visible, onComplete }: Props) {
  // 表示のたびに新しいコンフィグを生成するためにkeyを使う
  const [configs] = React.useState<ParticleConfig[]>(() => generateConfigs());

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {configs.map((cfg, i) => (
        <SingleParticle
          key={i}
          config={cfg}
          color={color}
          visible={visible}
          onComplete={onComplete}
          isLast={i === PARTICLE_COUNT - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
