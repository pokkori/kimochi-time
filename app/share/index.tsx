/**
 * ShareCardScreen: 今日の気持ちをLINEでシェア
 */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { EMOTIONS } from '../../constants/emotions';
import { useStreak } from '../../hooks/useStreak';
import { shareTextToLine } from '../../lib/lineShare';

export default function ShareScreen() {
  const { current: streak } = useStreak();
  const [selectedId, setSelectedId] = useState<number>(5);
  const emotion = EMOTIONS.find((e) => e.id === selectedId) ?? EMOTIONS[4];

  async function handleShare() {
    await shareTextToLine(emotion.label, streak);
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.card}>
        <View style={[styles.colorPreview, { backgroundColor: emotion.color }]}>
          <Text style={[styles.colorLabel, { color: emotion.textColor }]}>
            {emotion.label}
          </Text>
          <Text style={[styles.streakText, { color: emotion.textColor }]}>
            {streak}日連続
          </Text>
        </View>
        <Text style={styles.shareMessage}>
          「今の気持ちは{emotion.label}です（{streak}日連続でシェア中）」
        </Text>
      </Animated.View>

      {/* 感情選択 */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.selector}>
        <Text style={styles.selectorLabel}>シェアする気持ちを選ぶ</Text>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {EMOTIONS.map((e) => (
            <TouchableOpacity
              key={e.id}
              style={[styles.chip, { backgroundColor: e.color }, selectedId === e.id && styles.chipSelected]}
              onPress={() => setSelectedId(e.id)}
              accessibilityRole="radio"
              accessibilityLabel={e.label}
              accessibilityState={{ checked: selectedId === e.id }}
            >
              <Text style={[styles.chipText, { color: e.textColor }]}>{e.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      <TouchableOpacity
        style={styles.lineButton}
        onPress={handleShare}
        accessibilityRole="button"
        accessibilityLabel="LINEで今日の気持ちをシェアする"
        accessibilityHint="LINEアプリが開いてメッセージを送れます"
      >
        <Text style={styles.lineButtonText}>LINEでシェア</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        シェアされるのはテキストメッセージのみです。
        LINEの利用規約に準拠した形式で送信します。
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 16, paddingBottom: 48, alignItems: 'center' },
  card: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  colorPreview: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorLabel: { fontSize: 28, fontWeight: '900', letterSpacing: 1 },
  streakText: { fontSize: 16, fontWeight: '700', marginTop: 8, opacity: 0.8 },
  shareMessage: {
    padding: 16,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    textAlign: 'center',
  },
  selector: { width: '100%' },
  selectorLabel: { fontSize: 14, fontWeight: '600', color: Colors.textLight, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 10, minHeight: 36,
    justifyContent: 'center', alignItems: 'center',
  },
  chipSelected: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 4,
  },
  chipText: { fontSize: 12, fontWeight: '700' },
  lineButton: {
    backgroundColor: '#06C755',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    minHeight: 60,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#06C755',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  lineButtonText: { fontSize: 17, fontWeight: '800', color: Colors.white },
  note: { fontSize: 11, color: Colors.textLight, textAlign: 'center', lineHeight: 16 },
});
