import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/colors';

interface Props {
  daysSinceFirst?: number;
  hasPreview?: boolean;
  children?: React.ReactNode;
}

function LockSVG() {
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 11H7V8C7 5.24 9.24 3 12 3C14.76 3 17 5.24 17 8V11Z"
        stroke={Colors.primary}
        strokeWidth={2}
        fill="none"
      />
      <Path
        d="M18 11H6C4.9 11 4 11.9 4 13V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V13C20 11.9 19.1 11 18 11Z"
        fill={Colors.primary}
        opacity={0.9}
      />
      <Path
        d="M12 16C12.55 16 13 15.55 13 15C13 14.45 12.55 14 12 14C11.45 14 11 14.45 11 15C11 15.55 11.45 16 12 16Z"
        fill="white"
      />
    </Svg>
  );
}

export function PremiumGate({ daysSinceFirst, hasPreview, children }: Props) {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      {/* プレビューコンテンツ（ぼかし） */}
      {hasPreview && children && (
        <View style={styles.preview} pointerEvents="none">
          {children}
          <View style={styles.previewFade} />
        </View>
      )}

      {/* ゲートオーバーレイ */}
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LockSVG />
          <Text style={styles.title}>
            {daysSinceFirst !== undefined && daysSinceFirst >= 7
              ? 'ふたりの感情グラフがあります'
              : '感情グラフ'}
          </Text>
          {daysSinceFirst !== undefined && daysSinceFirst >= 7 && (
            <Text style={styles.subtitle}>
              {daysSinceFirst}日間の気持ちの流れを見てみませんか？
            </Text>
          )}

          {/* 価値訴求 */}
          <View style={styles.benefitList}>
            {[
              '2人の気持ちのズレが早くわかる',
              '7日間の感情グラフ閲覧',
              '毎週のAI感情分析レポート',
              '広告なし',
            ].map((item) => (
              <View key={item} style={styles.benefitItem}>
                <View style={styles.checkDot} />
                <Text style={styles.benefitText}>{item}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/subscribe')}
            accessibilityRole="button"
            accessibilityLabel="スタンダードプランで感情グラフを解放する"
            accessibilityHint="月額480円のサブスクリプション画面に移動します"
          >
            <Text style={styles.ctaText}>グラフを解放する</Text>
            <Text style={styles.ctaPrice}>月額480円 (1日約16円)</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            いつでもキャンセル可能。次回更新日の24時間前まで解約できます。
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  preview: {
    position: 'relative',
    overflow: 'hidden',
  },
  previewFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(255,245,248,0)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,245,248,0.92)',
    zIndex: 10,
    padding: 16,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  benefitList: {
    width: '100%',
    marginTop: 16,
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.text,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 20,
    minHeight: 60,
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
  },
  ctaPrice: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  note: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 14,
  },
});
