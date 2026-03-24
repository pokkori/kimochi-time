/**
 * GraphScreen: 2人の週次感情推移グラフ（7日後有料ゲート）
 */
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { EmotionGraph } from '../../components/EmotionGraph';
import { PremiumGate } from '../../components/PremiumGate';
import { Colors } from '../../constants/colors';
import { useSubscription } from '../../hooks/useSubscription';
import { getRecentEmotionLogsAsync } from '../../lib/emotionStorage';

interface DataPoint { date: string; emotionId: number }

export default function GraphScreen() {
  const router = useRouter();
  const { isGraphGated, canViewGraph, daysSinceFirst, loading } = useSubscription();
  const [myData, setMyData] = useState<DataPoint[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const logs = await getRecentEmotionLogsAsync(7);
    const points: DataPoint[] = logs.map((l) => ({
      date: l.createdAt.slice(0, 10),
      emotionId: l.emotionId,
    }));
    // 日付ごとに最新1件を使用
    const map = new Map<string, DataPoint>();
    for (const p of points) {
      if (!map.has(p.date)) map.set(p.date, p);
    }
    setMyData(Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date)));
  }

  if (loading) return <View style={styles.root} />;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(400)}>
        <Text style={styles.title}>感情グラフ</Text>
        <Text style={styles.subtitle}>ふたりの気持ちの流れ</Text>
      </Animated.View>

      {/* 7日後有料ゲート */}
      {isGraphGated ? (
        <PremiumGate daysSinceFirst={daysSinceFirst} hasPreview={myData.length >= 3}>
          <EmotionGraph myData={myData.slice(0, 3)} blurFrom={3} />
        </PremiumGate>
      ) : (
        <View style={styles.graphCard}>
          <EmotionGraph myData={myData} width={340} height={220} />
          {!canViewGraph && (
            <Text style={styles.hint}>
              あと{7 - daysSinceFirst}日送り続けるとグラフが完成します
            </Text>
          )}
        </View>
      )}

      {/* AI分析レポートへの誘導 */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>AI感情分析レポート</Text>
        <Text style={styles.analysisPreview}>
          今週のあなたの感情傾向は「{myData.length > 0 ? '安定' : '---'}」です。
          続きを読むには...
        </Text>
        <TouchableOpacity
          style={styles.analysisButton}
          onPress={() => router.push('/analysis')}
          accessibilityRole="button"
          accessibilityLabel="AI感情分析レポートを見る"
          accessibilityHint="スタンダードプランで全文を読めます"
        >
          <Text style={styles.analysisButtonText}>レポートを見る</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
    marginBottom: 8,
  },
  graphCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  hint: {
    marginTop: 12,
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
  },
  analysisCard: {
    backgroundColor: Colors.glassBlur,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  analysisPreview: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  analysisButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 46,
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  analysisButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
