import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Colors } from '../constants/colors';

export interface SlideData {
  id: number;
  title: string;
  description: string;
  illustration: 'emotion' | 'partner' | 'streak';
}

const { width: SCREEN_W } = Dimensions.get('window');

function EmotionIllustration() {
  return (
    <Svg width={200} height={160} viewBox="0 0 200 160">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
        const colors = ['#1A1A2E','#4A4E8C','#7B8CB3','#A8B4C4','#E8E4D9','#FFD166','#F4A261','#E76F51','#FF6B9D'];
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 20 + col * 56;
        const y = 20 + row * 46;
        return (
          <Rect key={i} x={x} y={y} width={48} height={38} rx={10} fill={colors[i]} opacity={0.9} />
        );
      })}
    </Svg>
  );
}

function PartnerIllustration() {
  return (
    <Svg width={200} height={160} viewBox="0 0 200 160">
      <Circle cx={70} cy={80} r={40} fill={Colors.primary} opacity={0.85} />
      <Circle cx={130} cy={80} r={40} fill={Colors.secondary} opacity={0.85} />
      <Path d="M 90 80 Q 100 95 110 80" stroke="white" strokeWidth={3} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

function StreakIllustration() {
  return (
    <Svg width={200} height={160} viewBox="0 0 200 160">
      <Path
        d="M100 20C100 20 70 55 70 80C70 97.5 82.5 110 95 117.5C91.25 107 95 95 100 87.5C105 95 108.75 107 105 117.5C117.5 110 130 97.5 130 80C130 55 100 20 100 20Z"
        fill={Colors.streakOrange}
        opacity={0.9}
      />
      <Path
        d="M100 140C107.2 140 113 133.8 113 126C113 120.1 109 115.3 105 112.5C106.5 117.3 105 122.5 101.5 126C99.5 121.5 96.5 118.5 95 112.5C91 115.3 87 120.1 87 126C87 133.8 92.8 140 100 140Z"
        fill={Colors.streakOrange}
        opacity={0.7}
      />
    </Svg>
  );
}

const ILLUSTRATIONS: Record<SlideData['illustration'], React.FC> = {
  emotion: EmotionIllustration,
  partner: PartnerIllustration,
  streak: StreakIllustration,
};

interface Props {
  slide: SlideData;
}

export function OnboardingSlide({ slide }: Props) {
  const Illustration = ILLUSTRATIONS[slide.illustration];

  return (
    <View style={[styles.container, { width: SCREEN_W }]}>
      <View style={styles.illustrationWrapper}>
        <Illustration />
      </View>
      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.description}>{slide.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  illustrationWrapper: {
    width: 200,
    height: 160,
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
});
