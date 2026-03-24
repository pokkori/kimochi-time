import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  delay: number;
}

interface Props {
  color: string;
  visible: boolean;
  onComplete?: () => void;
}

const PARTICLE_COUNT = 30;

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 300 - 150,
    y: -(Math.random() * 400 + 100),
    angle: Math.random() * 360,
    delay: Math.random() * 300,
  }));
}

function ParticleView({
  particle,
  color,
}: {
  particle: Particle;
  color: string;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateX.value = withDelay(
      particle.delay,
      withTiming(particle.x, { duration: 1200 }),
    );
    translateY.value = withDelay(
      particle.delay,
      withTiming(particle.y, { duration: 1200 }),
    );
    opacity.value = withDelay(
      particle.delay + 600,
      withTiming(0, { duration: 600 }),
    );
    scale.value = withDelay(
      particle.delay,
      withSequence(
        withTiming(1.5, { duration: 200 }),
        withTiming(0.5, { duration: 1000 }),
      ),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${particle.angle}deg` },
    ],
    opacity: opacity.value,
  }));

  const size = 6 + Math.random() * 8;

  return (
    <Animated.View
      style={[
        styles.particle,
        style,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    />
  );
}

export function SendAnimation({ color, visible, onComplete }: Props) {
  const particles = React.useMemo(() => generateParticles(), []);

  useEffect(() => {
    if (visible && onComplete) {
      const timer = setTimeout(onComplete, 1800);
      return () => clearTimeout(timer);
    }
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <Animated.View
      style={styles.container}
      entering={FadeIn.duration(100)}
      exiting={FadeOut.duration(300)}
      pointerEvents="none"
    >
      {particles.map((p) => (
        <ParticleView key={p.id} particle={p} color={color} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  particle: {
    position: 'absolute',
  },
});
