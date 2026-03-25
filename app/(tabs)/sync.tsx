/**
 * SyncScreen: シンクログラフ（ふたりの感情一致度・カレンダー可視化）
 * 競合ゼロの差別化機能 – Between/COUPPLY/Pairy にリアルタイム感情共有なし
 */
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MoodIcon } from '../../components/MoodIcon';
import { getMoodById, MOODS } from '../../constants/moods';
import {
  calculateSyncRateAsync,
  DaySyncStatus,
  getDaySyncStatusListAsync,
  getTopMoodAsync,
} from '../../lib/moodLog';

const { width: SCREEN_W } = Dimensions.get('window');
const CALENDAR_DAYS = 14;

// ─── シンクロ率サークル ──────────────────────────────────────

function SyncRateCircle({ rate }: { rate: number }) {
  const scale = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8, stiffness: 300 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.syncCircle, animStyle]}>
      <Text style={styles.syncRateNumber}>{rate}</Text>
      <Text style={styles.syncRatePercent}>%</Text>
      <Text style={styles.syncRateLabel}>シンクロ率</Text>
    </Animated.View>
  );
}

// ─── カレンダーセル ──────────────────────────────────────────

function CalendarCell({ status }: { status: DaySyncStatus }) {
  const day = new Date(status.date).getDate();
  const hasSelf = status.selfMoodId !== null;
  const hasPartner = status.partnerMoodId !== null;
  const selfMood = status.selfMoodId ? getMoodById(status.selfMoodId) : undefined;

  let cellColor = 'rgba(255,255,255,0.06)';
  if (status.isSynced) cellColor = 'rgba(45,212,191,0.28)';
  else if (hasSelf && !hasPartner) cellColor = 'rgba(255,107,157,0.18)';

  return (
    <View style={[styles.calCell, { backgroundColor: cellColor }]}>
      <Text style={styles.calDayNum}>{day}</Text>
      {selfMood && (
        <MoodIcon mood={selfMood} size={18} />
      )}
      {status.isSynced && (
        <View style={styles.syncedDot} />
      )}
    </View>
  );
}

// ─── メイン画面 ─────────────────────────────────────────────

export default function SyncScreen() {
  const [syncRate, setSyncRate] = useState(0);
  const [calData, setCalData] = useState<DaySyncStatus[]>([]);
  const [topMood, setTopMood] = useState<{ moodId: string; count: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [rate, cal, top] = await Promise.all([
        calculateSyncRateAsync(30),
        getDaySyncStatusListAsync(CALENDAR_DAYS),
        getTopMoodAsync(30),
      ]);
      setSyncRate(rate);
      setCalData(cal);
      setTopMood(top);
    } catch (e) {
      console.warn('[SyncScreen] load error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleShare() {
    const topLabel = topMood ? getMoodById(topMood.moodId)?.label : null;
    const text = `ふたりのシンクロ率${syncRate}%達成！${topLabel ? `\n一番多く共有した気持ち: ${topLabel}` : ''}\n#キモチタイム #カップル`;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(text);
        Alert.alert('コピーしました', 'Xに貼り付けてシェアしてください');
      } else {
        await Share.share({ message: text });
      }
    } catch {
      // キャンセルはサイレント
    }
  }

  if (loading) return <View style={styles.root} />;

  const topMoodData = topMood ? getMoodById(topMood.moodId) : undefined;
  const syncedDays = calData.filter((d) => d.isSynced).length;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* タイトル */}
      <Animated.View entering={FadeIn.duration(400)}>
        <Text style={styles.title}>シンクログラフ</Text>
        <Text style={styles.subtitle}>ふたりの感情がつながる瞬間</Text>
      </Animated.View>

      {/* シンクロ率サークル */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.circleWrapper}>
        <View style={styles.glassCard}>
          <Text style={styles.cardLabel}>今月のシンクロ率</Text>
          <SyncRateCircle rate={syncRate} />
          <Text style={styles.circleCaption}>
            {syncedDays}日間 気持ちがシンクロしました
          </Text>
        </View>
      </Animated.View>

      {/* 過去14日カレンダー */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.glassCard}>
        <Text style={styles.cardLabel}>過去14日の感情カレンダー</Text>
        <View style={styles.calLegend}>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(45,212,191,0.5)' }]} />
          <Text style={styles.legendText}>シンクロした日</Text>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(255,107,157,0.4)', marginLeft: 12 }]} />
          <Text style={styles.legendText}>自分のみ記録</Text>
        </View>
        <View style={styles.calGrid}>
          {calData.map((s) => (
            <CalendarCell key={s.date} status={s} />
          ))}
        </View>
      </Animated.View>

      {/* トップムード */}
      {topMoodData && (
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.glassCard}>
          <Text style={styles.cardLabel}>一番多く共有した気持ち</Text>
          <View style={styles.topMoodRow}>
            <MoodIcon mood={topMoodData} size={48} />
            <View style={styles.topMoodInfo}>
              <Text style={styles.topMoodLabel}>{topMoodData.label}</Text>
              <Text style={styles.topMoodCount}>{topMood!.count}日間</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ムード一覧（参考表示） */}
      <Animated.View entering={FadeInDown.delay(380).duration(400)} style={styles.glassCard}>
        <Text style={styles.cardLabel}>8つの気持ちアイコン</Text>
        <View style={styles.moodGrid}>
          {MOODS.map((mood) => (
            <View key={mood.id} style={styles.moodGridItem}>
              <MoodIcon mood={mood} size={36} />
              <Text style={[styles.moodGridLabel, { color: mood.color }]}>
                {mood.label}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Xシェアボタン */}
      <Animated.View entering={FadeInDown.delay(450).duration(400)}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          accessibilityRole="button"
          accessibilityLabel="シンクロ率をXでシェアする"
          accessibilityHint="シンクロ率と一番多かった気持ちをXに投稿します"
        >
          <Text style={styles.shareButtonText}>
            シンクロ率{syncRate}%をシェア
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
    marginBottom: 4,
  },
  // glassmorphism カード
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  // シンクロ率サークル
  circleWrapper: {
    alignItems: 'center',
  },
  syncCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(45,212,191,0.12)',
    borderWidth: 2,
    borderColor: '#2DD4BF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 8,
  },
  syncRateNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFD93D',
    lineHeight: 68,
  },
  syncRatePercent: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFD93D',
    marginTop: -4,
  },
  syncRateLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  circleCaption: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    marginTop: 8,
  },
  // カレンダー
  calLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 4,
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  calCell: {
    width: (SCREEN_W - 40 - 40 - 6 * 6) / 7,
    minWidth: 38,
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  calDayNum: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  syncedDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#2DD4BF',
  },
  // トップムード
  topMoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  topMoodInfo: {
    gap: 4,
  },
  topMoodLabel: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  topMoodCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
  },
  // ムードグリッド
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodGridItem: {
    alignItems: 'center',
    gap: 4,
    width: (SCREEN_W - 40 - 40 - 12 * 3) / 4,
  },
  moodGridLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  // シェアボタン
  shareButton: {
    backgroundColor: '#2DD4BF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    minHeight: 56,
    alignItems: 'center',
    shadowColor: '#2DD4BF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: 0.3,
  },
});
