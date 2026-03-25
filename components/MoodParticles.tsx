/**
 * MoodParticles: 感情選択時のハートパーティクル演出（10個・react-native Animated使用）
 * Easing.linear 禁止 → spring アニメーション採用
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PARTICLE_COUNT = 10;

const HEART_PATH =
  'M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z';

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  startX: number;
  startY: number;
}

interface Props {
  color: string;
  visible: boolean;
  onComplete?: () => void;
}

function createParticle(): Particle {
  const startX = SCREEN_W / 2 + (Math.random() - 0.5) * SCREEN_W * 0.6;
  const startY = SCREEN_H * 0.55;
  return {
    x: new Animated.Value(startX),
    y: new Animated.Value(startY),
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0),
    startX,
    startY,
  };
}

export function MoodParticles({ color, visible, onComplete }: Props) {
  const particles = useRef<Particle[]>(
    Array.from({ length: PARTICLE_COUNT }, createParticle),
  );

  useEffect(() => {
    if (!visible) return;

    const p = particles.current;
    // 各パーティクルをリセット
    p.forEach((pt) => {
      const newX = SCREEN_W / 2 + (Math.random() - 0.5) * SCREEN_W * 0.6;
      const newY = SCREEN_H * 0.55;
      pt.x.setValue(newX);
      pt.y.setValue(newY);
      pt.opacity.setValue(0);
      pt.scale.setValue(0);
      pt.startX = newX;
      pt.startY = newY;
    });

    const animations = p.map((pt, i) => {
      const targetX = pt.startX + (Math.random() - 0.5) * 160;
      const targetY = pt.startY - 80 - Math.random() * 200;
      const delay = i * 60;

      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          // スケール: spring でバウンス
          Animated.spring(pt.scale, {
            toValue: 0.6 + Math.random() * 0.6,
            damping: 8,
            stiffness: 300,
            useNativeDriver: true,
          }),
          // フェードイン
          Animated.timing(pt.opacity, {
            toValue: 0.85,
            duration: 180,
            useNativeDriver: true,
          }),
          // Y: 上昇
          Animated.timing(pt.y, {
            toValue: targetY,
            duration: 900,
            useNativeDriver: true,
          }),
          // X: 左右に散る
          Animated.timing(pt.x, {
            toValue: targetX,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        // フェードアウト
        Animated.timing(pt.opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start(() => {
      onComplete?.();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.current.map((pt, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: [
              { translateX: pt.x },
              { translateY: pt.y },
              { scale: pt.scale },
            ],
            opacity: pt.opacity,
          }}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill={color}>
            <Path d={HEART_PATH} fill={color} />
          </Svg>
        </Animated.View>
      ))}
    </View>
  );
}
