/**
 * MoodIcon: 8種ムードをSVGで描画するコンポーネント（絵文字不使用）
 * Reanimated 3.10.1 (SDK 51) 対応
 * - タップ時: scale 1→1.3→1.0 (spring damping:8, stiffness:300)
 * - 選択状態: 0.8秒周期 scale 1→1.05→1 (withRepeat + withSequence)
 */
import React, { useEffect } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { Mood } from '../constants/moods';

interface Props {
  mood: Mood;
  size?: number;
  /** 選択状態のとき true → 背景サークル表示 + パルスアニメーション */
  selected?: boolean;
}

export function MoodIcon({ mood, size = 40, selected = false }: Props) {
  const scale = useSharedValue(1);
  const strokeScale = size / 24;

  useEffect(() => {
    if (selected) {
      // 選択状態: 0.8秒周期で微小パルス
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 400 }),
          withTiming(1.0, { duration: 400 }),
        ),
        -1,
        false,
      );
    } else {
      // 非選択状態: スケールをリセット
      scale.value = withSpring(1, { damping: 8, stiffness: 300 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {selected && (
          <Circle cx={12} cy={12} r={11} fill={mood.color} opacity={0.25} />
        )}
        <Path
          d={mood.svgPath}
          fill={mood.id === 'love' ? mood.color : 'none'}
          stroke={mood.color}
          strokeWidth={1.6 / strokeScale}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {mood.svgPathAccent && (
          <Path
            d={mood.svgPathAccent}
            fill="none"
            stroke={mood.color}
            strokeWidth={1.6 / strokeScale}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </Svg>
    </Animated.View>
  );
}
