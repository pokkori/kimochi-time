/**
 * MoodIcon: 8種ムードをSVGで描画するコンポーネント（絵文字不使用）
 */
import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { Mood } from '../constants/moods';

interface Props {
  mood: Mood;
  size?: number;
  /** 選択状態のとき true → 背景サークル表示 */
  selected?: boolean;
}

export function MoodIcon({ mood, size = 40, selected = false }: Props) {
  const scale = size / 24;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* 選択状態の背景サークル */}
      {selected && (
        <Circle cx={12} cy={12} r={11} fill={mood.color} opacity={0.25} />
      )}
      {/* メインパス */}
      <Path
        d={mood.svgPath}
        fill={mood.id === 'love' ? mood.color : 'none'}
        stroke={mood.color}
        strokeWidth={1.6 / scale}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* アクセントパス（表情線など） */}
      {mood.svgPathAccent && (
        <Path
          d={mood.svgPathAccent}
          fill="none"
          stroke={mood.color}
          strokeWidth={1.6 / scale}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}
