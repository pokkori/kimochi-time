/**
 * AnalysisScreen: AI感情分析レポート（月額480円プラン限定）
 */
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { useSubscription } from '../../hooks/useSubscription';
import { getRecentEmotionLogsAsync } from '../../lib/emotionStorage';

function MockReport({ avgScore }: { avgScore: number }) {
  const trend = avgScore >= 7 ? '良好' : avgScore >= 5 ? '安定' : '波あり';
  const advice = avgScore >= 7
    ? '良い一週間でした。この調子を維持しましょう。'
    : avgScore >= 5
    ? '平均的な一週間です。小さな楽しいことを見つけると気持ちが上向きます。'
    : '少し疲れているかもしれません。ゆっくり休む時間を作ってみてください。';

  return (
    <View style={styles.reportCard}>
      <Text style={styles.reportSection}>今週の感情傾向</Text>
      <Text style={styles.reportText}>あなたの今週の気持ちは「{trend}」でした。平均スコア: {avgScore.toFixed(1)} / 9</Text>
      <Text style={styles.reportSection}>パートナーとの感情シンクロ率</Text>
      <Text style={styles.reportText}>感情の一致率は約68%です。（パートナーデータ連携後に正確な値が表示されます）</Text>
      <Text style={styles.reportSection}>来週のアドバイス</Text>
      <Text style={styles.reportText}>{advice}</Text>
      <Text style={styles.disclaimer}>
        ※ このレポートはAIによる参考情報です。医療的診断・アドバイスではありません。
        心配な場合は専門家にご相談ください。
      </Text>
    </View>
  );
}

export default function AnalysisScreen() {
  const router = useRouter();
  const { isStandard, isFamily, loading } = useSubscription();
  const [avgScore, setAvgScore] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const logs = await getRecentEmotionLogsAsync(7);
    if (logs.length === 0) return;
    const avg = logs.reduce((sum, l) => sum + l.emotionId, 0) / logs.length;
    setAvgScore(avg);
  }

  const isPremium = isStandard || isFamily;

  if (loading) return <View style={styles.root} />;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(400)}>
        <Text style={styles.title}>AI感情分析レポート</Text>
        <Text style={styles.subtitle}>毎週日曜20:00に最新レポートが届きます</Text>
      </Animated.View>

      {isPremium ? (
        avgScore !== null ? (
          <MockReport avgScore={avgScore} />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>まだデータが不足しています。7日間送り続けると分析が開始されます。</Text>
          </View>
        )
      ) : (
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.gateCard}>
          <Text style={styles.gateTitle}>スタンダードプランで解放</Text>
          <Text style={styles.gateDesc}>
            週次AI感情分析レポートで、ふたりの感情パターンや{'\n'}
            シンクロ率が一目でわかります。
          </Text>
          <TouchableOpacity
            style={styles.gateButton}
            onPress={() => router.push('/subscribe')}
            accessibilityRole="button"
            accessibilityLabel="スタンダードプランでレポートを解放する"
          >
            <Text style={styles.gateButtonText}>月額480円で解放する</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 16, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textLight, marginTop: 4 },
  reportCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  reportSection: { fontSize: 13, fontWeight: '700', color: Colors.primary, letterSpacing: 0.3 },
  reportText: { fontSize: 14, color: Colors.text, lineHeight: 22 },
  disclaimer: {
    fontSize: 11,
    color: Colors.textLight,
    lineHeight: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 10,
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14, color: Colors.textLight, textAlign: 'center', lineHeight: 22 },
  gateCard: {
    backgroundColor: Colors.glassBlur,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  gateTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  gateDesc: { fontSize: 14, color: Colors.textLight, textAlign: 'center', lineHeight: 22 },
  gateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 52,
    alignItems: 'center',
    marginTop: 4,
  },
  gateButtonText: { fontSize: 15, fontWeight: '800', color: Colors.white },
});
