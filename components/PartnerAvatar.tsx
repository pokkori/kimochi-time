import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { EMOTIONS } from '../constants/emotions';

interface Props {
  emotionId?: number;
  name?: string;
  size?: number;
  showLabel?: boolean;
}

function QuestionMarkSVG({ size }: { size: number }) {
  return (
    <Svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
      <Path
        d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 17h.01"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PartnerAvatar({ emotionId, name, size = 80, showLabel = true }: Props) {
  const emotion = emotionId ? EMOTIONS.find((e) => e.id === emotionId) : null;
  const bgColor = emotion ? emotion.color : 'rgba(168,180,196,0.5)';
  const label = emotion ? emotion.label : '未送信';

  return (
    <View
      style={styles.wrapper}
      accessibilityRole="image"
      accessibilityLabel={
        name
          ? `${name}の気分: ${label}`
          : `パートナーの気分: ${label}`
      }
    >
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bgColor,
          },
        ]}
      >
        {!emotion && <QuestionMarkSVG size={size} />}
        {emotion && (
          <Text
            style={[
              styles.labelInside,
              {
                color: emotion.textColor,
                fontSize: size * 0.14,
              },
            ]}
            numberOfLines={2}
          >
            {emotion.label}
          </Text>
        )}
      </View>
      {showLabel && (
        <Text style={styles.name} numberOfLines={1}>
          {name ?? 'パートナー'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 4,
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  labelInside: {
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 4,
    lineHeight: 16,
  },
  name: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '600',
  },
});
