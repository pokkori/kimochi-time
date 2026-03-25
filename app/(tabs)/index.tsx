/**
 * HomeScreen: 9段階感情ボタン・パートナーの最新気持ち・ストリーク
 */
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { AdBanner } from '../../components/AdBanner';
import { EmotionButton } from '../../components/EmotionButton';
import { MoodIcon } from '../../components/MoodIcon';
import { MoodParticles } from '../../components/MoodParticles';
import { PartnerAvatar } from '../../components/PartnerAvatar';
import { SendAnimation } from '../../components/SendAnimation';
import { StreakBadge } from '../../components/StreakBadge';
import { Colors } from '../../constants/colors';
import { EMOTIONS, Emotion } from '../../constants/emotions';
import { getMoodById, MOODS, Mood } from '../../constants/moods';
import { useAudio } from '../../hooks/useAudio';
import { useStreak } from '../../hooks/useStreak';
import {
  addEmotionLogAsync,
  getDailyAdCountAsync,
  getTodaySendCountAsync,
  incrementDailyAdCountAsync,
  incrementSendCountAsync,
} from '../../lib/emotionStorage';
import { calculateSyncRateAsync, saveMoodEntryAsync } from '../../lib/moodLog';
import {
  sendStreakMilestoneNotificationAsync,
} from '../../lib/notifications';
import { INTERSTITIAL_DAILY_LIMIT, INTERSTITIAL_INTERVAL } from '../../constants/admob';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── ムードセル: タップ時スプリングバウンス ───────────────────────────────
interface AnimatedMoodCellProps {
  mood: import('../../constants/moods').Mood;
  selected: boolean;
  onPress: () => void;
  cellStyle: object | object[];
}

function AnimatedMoodCell({ mood, selected, onPress, cellStyle }: AnimatedMoodCellProps) {
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    // scale 1→1.3→1.0 spring bounce
    scale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 300 }),
      withSpring(1.0, { damping: 8, stiffness: 300 }),
    );
    onPress();
  }, [onPress, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        style={cellStyle}
        onPress={handlePress}
        accessibilityRole="radio"
        accessibilityLabel={mood.label}
        accessibilityState={{ selected }}
      >
        <MoodIcon mood={mood} size={32} selected={selected} />
        <Text style={[styles.moodCellLabel, { color: mood.color }]}>
          {mood.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── ミュートアイコン ─────────────────────────────────────────────────────
function MuteIcon({ muted, color }: { muted: boolean; color: string }) {
  if (muted) {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d="M11 5L6 9H2v6h4l5 4V5z" fill={color} />
        <Path d="M23 9l-6 6M17 9l6 6" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M11 5L6 9H2v6h4l5 4V5z" fill={color} />
      <Path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { current: streak, milestone, onSend: onStreakSend, clearMilestone } = useStreak();
  const { playBGM, toggleMute, playSE, isMuted } = useAudio();
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [sending, setSending] = useState(false);
  const [showParticle, setShowParticle] = useState(false);
  const [sentEmotion, setSentEmotion] = useState<Emotion | null>(null);

  // 8種ムード選択（差別化機能）
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [showMoodParticles, setShowMoodParticles] = useState(false);
  const [moodParticleColor, setMoodParticleColor] = useState('#FF6B9D');
  // シンクロ率バナー
  const [syncRate, setSyncRate] = useState<number | null>(null);

  // パートナーの最新気分（AsyncStorageからキャッシュ取得・Supabase Realtime接続後に置き換え）
  const [partnerEmotion, setPartnerEmotion] = useState<number | undefined>(undefined);
  const partnerName = 'パートナー';

  useEffect(() => {
    // ローカルの最新送信感情をパートナー欄に反映（デモ: 実際はSupabase Realtimeで取得）
    import('../../lib/emotionStorage').then(({ getEmotionLogsAsync }) => {
      getEmotionLogsAsync().then((logs) => {
        if (logs.length > 0) {
          setPartnerEmotion(logs[0].emotionId);
        }
      }).catch(() => {});
    });
  }, []);

  useEffect(() => {
    playBGM();
    // シンクロ率を非同期ロード
    calculateSyncRateAsync(30).then(setSyncRate).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ストリークマイルストーン表示
  useEffect(() => {
    if (milestone) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSE('streak');
      sendStreakMilestoneNotificationAsync(milestone).catch(() => {});
      Alert.alert(
        `${milestone}日連続達成！`,
        `すごい！ふたりの絆が深まっています。`,
        [{ text: 'OK', onPress: clearMilestone }],
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestone]);

  async function handleSend() {
    if (!selectedEmotion || sending) return;
    setSending(true);

    try {
      await playSE('send');
      await addEmotionLogAsync(selectedEmotion.id);
      const newStreak = await onStreakSend();
      const sendCount = await incrementSendCountAsync();

      // パーティクルアニメーション
      setShowParticle(true);
      setSentEmotion(selectedEmotion);
      // 送信後にパートナー表示を更新（ローカルデモ）
      setPartnerEmotion(selectedEmotion.id);

      // ムード送信（差別化機能: シンクログラフ用）
      if (selectedMood) {
        await saveMoodEntryAsync(selectedMood.id);
        // ムードパーティクル演出
        setMoodParticleColor(selectedMood.color);
        setShowMoodParticles(true);
        // シンクロ率を再計算して更新
        calculateSyncRateAsync(30).then(setSyncRate).catch(() => {});
      }

      // インタースティシャル広告判定（7回に1回・1日2回上限）
      if (sendCount % INTERSTITIAL_INTERVAL === 0) {
        const dailyAdCount = await getDailyAdCountAsync();
        if (dailyAdCount < INTERSTITIAL_DAILY_LIMIT) {
          await incrementDailyAdCountAsync();
          // TODO: AdMob インタースティシャル表示
          // InterstitialAd.show();
          console.info('[AdMob] インタースティシャル表示タイミング (stub)');
        }
      }

      void newStreak;
    } catch (e) {
      console.warn('[HomeScreen] send error', e);
    } finally {
      setSending(false);
    }
  }

  function handleParticleComplete() {
    setShowParticle(false);
    setSelectedEmotion(null);
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.appName}>キモチタイム</Text>
            <StreakBadge streak={streak} size="medium" />
          </View>
          <TouchableOpacity
            onPress={toggleMute}
            style={styles.muteButton}
            accessibilityRole="button"
            accessibilityLabel={isMuted ? 'BGMをオンにする' : 'BGMをミュートにする'}
            accessibilityHint="BGMのオン・オフを切り替えます"
          >
            <MuteIcon muted={isMuted} color={Colors.textLight} />
          </TouchableOpacity>
        </Animated.View>

        {/* シンクロ率バナー（差別化機能） */}
        {syncRate !== null && (
          <Animated.View entering={FadeInDown.delay(80).duration(400)}>
            <TouchableOpacity
              style={styles.syncBanner}
              onPress={() => router.push('/(tabs)/sync')}
              accessibilityRole="button"
              accessibilityLabel={`ふたりのシンクロ率${syncRate}パーセント。タップで詳細を見る`}
              accessibilityHint="シンクログラフ画面を開きます"
            >
              <View style={styles.syncBannerLeft}>
                <Text style={styles.syncBannerTitle}>シンクロ率</Text>
                <Text style={styles.syncBannerRate}>
                  {syncRate}<Text style={styles.syncBannerPct}>%</Text>
                </Text>
              </View>
              <Text style={styles.syncBannerArrow}>詳細 &gt;</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* パートナーの気持ち */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.partnerCard}>
          <Text style={styles.partnerTitle}>パートナーの今の気持ち</Text>
          <PartnerAvatar
            emotionId={partnerEmotion}
            name={partnerName}
            size={72}
          />
        </Animated.View>

        {/* 8種ムード選択（差別化: シンクログラフ連携） */}
        <Animated.View entering={FadeInDown.delay(170).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>今の気持ちをアイコンで選ぶ</Text>
          <View
            style={styles.moodGrid}
            accessibilityRole="radiogroup"
            accessibilityLabel="8種のムードアイコンから選んでください"
          >
            {MOODS.map((mood) => (
              <AnimatedMoodCell
                key={mood.id}
                mood={mood}
                selected={selectedMood?.id === mood.id}
                onPress={() => {
                  setSelectedMood(mood);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  playSE('tap');
                }}
                cellStyle={[
                  styles.moodCell,
                  selectedMood?.id === mood.id && {
                    backgroundColor: mood.color + '33',
                    borderColor: mood.color,
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* 感情ボタングリッド */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>今のあなたの気持ちは？</Text>
          <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel="気分を選んでください">
            {EMOTIONS.map((emotion) => (
              <EmotionButton
                key={emotion.id}
                emotion={emotion}
                selected={selectedEmotion?.id === emotion.id}
                onPress={(e) => {
                  setSelectedEmotion(e);
                  playSE('tap');
                }}
              />
            ))}
          </View>
        </Animated.View>

        {/* 選択中の感情ラベル */}
        {selectedEmotion && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.selectedLabel}>
            <View style={[styles.selectedDot, { backgroundColor: selectedEmotion.color }]} />
            <Text style={styles.selectedText}>「{selectedEmotion.label}」を選択中</Text>
          </Animated.View>
        )}

        {/* 送信完了メッセージ */}
        {sentEmotion && !showParticle && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.sentMessage}>
            <Text style={styles.sentText}>「{sentEmotion.label}」を送りました</Text>
          </Animated.View>
        )}

        {/* 送信ボタン */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!selectedEmotion || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!selectedEmotion || sending}
          accessibilityRole="button"
          accessibilityLabel="気持ちをパートナーに送る"
          accessibilityHint={
            selectedEmotion
              ? `${selectedEmotion.label}という気持ちを送ります`
              : '感情ボタンを選択してから送信できます'
          }
          accessibilityState={{ disabled: !selectedEmotion || sending }}
        >
          <Text style={styles.sendButtonText}>
            {sending ? '送信中...' : '気持ちを送る'}
          </Text>
        </TouchableOpacity>

        {/* シェアボタン */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => router.push('/share')}
          accessibilityRole="button"
          accessibilityLabel="今日の気持ちをLINEでシェアする"
        >
          <Text style={styles.shareButtonText}>LINEでシェア</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* パーティクルアニメーション（9段階感情） */}
      <SendAnimation
        color={showParticle ? (sentEmotion?.color ?? Colors.primary) : Colors.primary}
        visible={showParticle}
        onComplete={handleParticleComplete}
      />

      {/* ムードパーティクル演出（8種ムード選択時） */}
      <MoodParticles
        color={moodParticleColor}
        visible={showMoodParticles}
        onComplete={() => setShowMoodParticles(false)}
      />

      {/* AdMob バナー */}
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  muteButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  partnerCard: {
    width: '100%',
    backgroundColor: Colors.glassBlur,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  partnerTitle: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  section: {
    width: '100%',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  selectedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  selectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  selectedText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600',
  },
  sentMessage: {
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  sentText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '600',
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 56,
    minHeight: 60,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
  },
  shareButton: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minHeight: 52,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  // シンクロ率バナー
  syncBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(45,212,191,0.12)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    minHeight: 56,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.35)',
  },
  syncBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  syncBannerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2DD4BF',
  },
  syncBannerRate: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFD93D',
  },
  syncBannerPct: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD93D',
  },
  syncBannerArrow: {
    fontSize: 13,
    color: 'rgba(45,212,191,0.7)',
    fontWeight: '600',
  },
  // 8種ムードグリッド
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  moodCell: {
    width: (SCREEN_W - 40 - 8 * 3) / 4,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  moodCellLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
});
