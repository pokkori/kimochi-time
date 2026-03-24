import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { OnboardingSlide, SlideData } from '../../components/OnboardingSlide';
import { Colors } from '../../constants/colors';
import { setOnboardingDoneAsync } from '../../lib/emotionStorage';
import { scheduleDailyReminderAsync } from '../../lib/notifications';

const { width: SCREEN_W } = Dimensions.get('window');

const SLIDES: SlideData[] = [
  {
    id: 0,
    title: '色で気持ちを届けよう',
    description: '9色のボタンをタップするだけで、パートナーや家族に今の気持ちが届きます。テキストを打たなくていい。',
    illustration: 'emotion',
  },
  {
    id: 1,
    title: 'ふたりでつながる',
    description: 'パートナーを招待コードで招待しましょう。相手が気持ちを送ってくれたら、すぐに通知が届きます。',
    illustration: 'partner',
  },
  {
    id: 2,
    title: '毎日続けてストリークを伸ばそう',
    description: '毎日送り合うことで連続送信記録が伸びます。7日間続けると感情グラフが生成されます。',
    illustration: 'streak',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  async function finish() {
    await setOnboardingDoneAsync();
    try {
      await scheduleDailyReminderAsync();
    } catch { /* ignore */ }
    router.replace('/(tabs)');
  }

  function goNext() {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    } else {
      finish();
    }
  }

  return (
    <View style={styles.container}>
      {/* スキップボタン */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={finish}
        accessibilityRole="button"
        accessibilityLabel="オンボーディングをスキップ"
        accessibilityHint="スキップしてホーム画面に移動します"
      >
        <Text style={styles.skipText}>スキップ</Text>
      </TouchableOpacity>

      {/* スライド */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => String(item.id)}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <OnboardingSlide slide={item} />}
        style={styles.flatList}
      />

      {/* インジケーター */}
      <View style={styles.indicators} accessibilityRole="none">
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* ページ数テキスト */}
      <Text style={styles.pageText} accessibilityRole="text">
        {currentIndex + 1} / {SLIDES.length}
      </Text>

      {/* 次へ / 始めるボタン */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={goNext}
        accessibilityRole="button"
        accessibilityLabel={
          currentIndex < SLIDES.length - 1 ? '次へ進む' : 'キモチタイムを始める'
        }
      >
        <Text style={styles.nextText}>
          {currentIndex < SLIDES.length - 1 ? '次へ' : 'キモチタイムを始める'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 48,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  skipText: {
    fontSize: 15,
    color: Colors.textLight,
    fontWeight: '600',
  },
  flatList: {
    flex: 1,
    width: SCREEN_W,
  },
  indicators: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.divider,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  pageText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 24,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    minHeight: 60,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  nextText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
  },
});
