/**
 * ProfileScreen: プロフィール・パートナー招待・設定・課金プラン
 */
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StreakBadge } from '../../components/StreakBadge';
import { Colors } from '../../constants/colors';
import { useStreak } from '../../hooks/useStreak';
import { useSubscription } from '../../hooks/useSubscription';
import { getDaysSinceFirstPlayAsync } from '../../lib/emotionStorage';
import { restorePurchasesAsync } from '../../lib/revenuecat';
import { activateFreezeAsync, getFreezeRemainingAsync } from '../../lib/streakFreeze';

function SettingRow({
  label,
  value,
  onPress,
  danger,
  accessibilityLabel,
  accessibilityHint,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
    >
      <Text style={[styles.rowLabel, danger && styles.rowDanger]}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { current: streak, longest } = useStreak();
  const { isStandard, isFamily } = useSubscription();
  const [daysSinceFirst, setDaysSinceFirst] = useState(0);
  const [freezeRemaining, setFreezeRemaining] = useState(0);

  useEffect(() => {
    getDaysSinceFirstPlayAsync().then(setDaysSinceFirst);
    getFreezeRemainingAsync().then(setFreezeRemaining);
  }, []);

  const planLabel = isFamily ? 'ファミリー (¥680/月)' : isStandard ? 'スタンダード (¥480/月)' : '無料プラン';

  async function handleActivateFreeze() {
    if (!isStandard && !isFamily) {
      Alert.alert('プレミアム機能', 'ストリークフリーズはスタンダードプラン以上で利用できます。', [
        { text: 'プランを見る', onPress: () => router.push('/subscribe') },
        { text: 'キャンセル' },
      ]);
      return;
    }
    if (freezeRemaining <= 0) {
      Alert.alert('今月は使用済み', 'ストリークフリーズは月1回まで使用できます。来月また使えます。');
      return;
    }
    const ok = await activateFreezeAsync();
    if (ok) {
      setFreezeRemaining(0);
      Alert.alert('フリーズ発動！', '今日の送信がなくてもストリークを守ります。');
    }
  }

  async function handleRestore() {
    const ok = await restorePurchasesAsync();
    Alert.alert(ok ? '購入を復元しました' : '復元できる購入が見つかりませんでした');
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* ストリーク統計 */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.statsCard}>
        <Text style={styles.statsTitle}>あなたの記録</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <StreakBadge streak={streak} size="large" />
            <Text style={styles.statLabel}>連続送信</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{longest}</Text>
            <Text style={styles.statLabel}>最長記録</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{daysSinceFirst}</Text>
            <Text style={styles.statLabel}>利用日数</Text>
          </View>
        </View>
      </Animated.View>

      {/* パートナー */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
        <Text style={styles.sectionTitle}>パートナー</Text>
        <View style={styles.card}>
          <SettingRow
            label="パートナーを招待する"
            onPress={() => router.push('/invite')}
            accessibilityLabel="パートナーを招待する"
            accessibilityHint="招待コードでパートナーと連携します"
          />
          <SettingRow
            label="接続中のパートナー"
            value="未接続"
          />
        </View>
      </Animated.View>

      {/* ストリークフリーズ（プレミアム特典） */}
      {(isStandard || isFamily) && (
        <Animated.View entering={FadeInDown.delay(180).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>プレミアム特典</Text>
          <View style={styles.card}>
            <SettingRow
              label={`ストリークフリーズ（今月残り${freezeRemaining}回）`}
              value={freezeRemaining > 0 ? '使用可能' : '今月使用済み'}
              onPress={handleActivateFreeze}
              accessibilityLabel={`ストリークフリーズを発動する。今月残り${freezeRemaining}回`}
              accessibilityHint="今日送信しなくてもストリークを守ります"
            />
          </View>
        </Animated.View>
      )}

      {/* 課金プラン */}
      <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.section}>
        <Text style={styles.sectionTitle}>プラン</Text>
        <View style={styles.card}>
          <SettingRow label="現在のプラン" value={planLabel} />
          <SettingRow
            label="プランをアップグレード"
            onPress={() => router.push('/subscribe')}
            accessibilityLabel="サブスクリプションプランを変更する"
            accessibilityHint="感情グラフや分析レポートが使えるプランを選べます"
          />
          <SettingRow
            label="購入を復元する"
            onPress={handleRestore}
            accessibilityLabel="過去の購入を復元する"
          />
        </View>
      </Animated.View>

      {/* 法律・設定 */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
        <Text style={styles.sectionTitle}>設定・法律</Text>
        <View style={styles.card}>
          <SettingRow
            label="プライバシーポリシー"
            onPress={() => router.push('/legal/privacy')}
            accessibilityLabel="プライバシーポリシーを読む"
          />
          <SettingRow
            label="利用規約"
            onPress={() => router.push('/legal/terms')}
            accessibilityLabel="利用規約を読む"
          />
          <SettingRow
            label="特定商取引法に基づく表記"
            onPress={() => router.push('/legal/tokusho')}
            accessibilityLabel="特定商取引法に基づく表記を読む"
          />
        </View>
      </Animated.View>

      <Text style={styles.version}>キモチタイム v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 48, gap: 16 },
  statsCard: {
    backgroundColor: Colors.glassBlur,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: { alignItems: 'center', gap: 4 },
  statNumber: { fontSize: 26, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textLight, fontWeight: '600' },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.divider },
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textLight,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  rowLabel: { fontSize: 15, color: Colors.text },
  rowDanger: { color: Colors.danger },
  rowValue: { fontSize: 14, color: Colors.textLight },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 8,
  },
});
