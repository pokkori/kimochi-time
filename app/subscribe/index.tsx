/**
 * SubscribeScreen: RevenueCat課金モーダル（サブスク自動更新の説明必須）
 */
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { purchasePlanAsync, restorePurchasesAsync } from '../../lib/revenuecat';

function CheckSVG() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M20 6L9 17l-5-5" stroke={Colors.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const PLANS = [
  {
    id: 'standard' as const,
    name: 'スタンダード',
    price: '¥480/月 (自動更新)',
    pricePerDay: '1日約16円・初回から翌月以降同額',
    highlight: true,
    features: [
      '7日間グラフ機能 ¥480/月（自動更新）',
      '2人の気持ちのズレがわかる',
      'AI感情分析レポート（週次）',
      'ストリークフリーズ（月1回）',
      '広告非表示',
    ],
  },
  {
    id: 'family' as const,
    name: 'ファミリー',
    price: '¥680/月 (自動更新)',
    pricePerDay: '1日約23円・初回から翌月以降同額',
    highlight: false,
    features: [
      'スタンダードの全機能',
      'グループ拡張（最大5人）',
      'コメント機能',
      '子供の感情記録',
    ],
  },
];

export default function SubscribeScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'family'>('standard');
  const [loading, setLoading] = useState(false);

  async function handlePurchase() {
    setLoading(true);
    try {
      const ok = await purchasePlanAsync(selectedPlan);
      if (ok) {
        Alert.alert('購入完了', 'プランが有効になりました。', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('購入できませんでした', 'App Store/Google Playの設定を確認してください。');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    const ok = await restorePurchasesAsync();
    Alert.alert(ok ? '購入を復元しました' : '復元できる購入が見つかりませんでした');
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(400)}>
        <Text style={styles.title}>プランを選ぶ</Text>
        <Text style={styles.subtitle}>いつでもキャンセル可能。解約は次回更新日の24時間前までに設定からどうぞ。</Text>
      </Animated.View>

      {/* プランカード */}
      {PLANS.map((plan, i) => (
        <Animated.View key={plan.id} entering={FadeInDown.delay(i * 80).duration(400)}>
          <TouchableOpacity
            style={[
              styles.planCard,
              plan.highlight && styles.planHighlight,
              selectedPlan === plan.id && styles.planSelected,
            ]}
            onPress={() => setSelectedPlan(plan.id)}
            accessibilityRole="radio"
            accessibilityLabel={`${plan.name}プラン ${plan.price}`}
            accessibilityState={{ checked: selectedPlan === plan.id }}
          >
            {plan.highlight && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>おすすめ</Text>
              </View>
            )}
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPricePerDay}>{plan.pricePerDay}</Text>
              </View>
              <Text style={styles.planPrice}>{plan.price}</Text>
            </View>
            <View style={styles.features}>
              {plan.features.map((f) => (
                <View key={f} style={styles.featureRow}>
                  <CheckSVG />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}

      {/* AI機能の利用開示（App Store Guideline 5.1.2(i) 対応） */}
      <View style={[styles.legalBox, { backgroundColor: 'rgba(255,107,157,0.05)' }]} accessibilityRole="text">
        <Text style={[styles.legalText, { color: Colors.text }]}>
          感情分析レポート機能にAnthropic（Claude）のAIを使用しています。
          レポートは参考情報であり、医療的診断・治療の代替ではありません。
        </Text>
      </View>

      {/* サブスク自動更新説明（審査対策・法律要件・App Store Review Guideline 3.1.2） */}
      <View style={styles.legalBox} accessibilityRole="text">
        <Text style={styles.legalText}>
          【自動更新サブスクリプションについて】{'\n'}
          選択したプランは毎月自動更新されます。更新は次回更新日の24時間前に請求されます。{'\n'}
          App Store {'>'} サブスクリプション管理から解約可能です。{'\n'}
          初回から翌月以降同額が請求されます。{'\n\n'}
          AppleID / Google Play アカウントに課金されます。
        </Text>
      </View>

      {/* 購入ボタン */}
      <TouchableOpacity
        style={[styles.purchaseButton, loading && styles.purchaseButtonDisabled]}
        onPress={handlePurchase}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel={`${PLANS.find((p) => p.id === selectedPlan)?.name}プランを購入する`}
        accessibilityHint="サブスクリプションを開始します"
        accessibilityState={{ disabled: loading }}
      >
        <Text style={styles.purchaseButtonText}>
          {loading ? '処理中...' : `${PLANS.find((p) => p.id === selectedPlan)?.name}プランを始める`}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        accessibilityRole="button"
        accessibilityLabel="以前の購入を復元する"
      >
        <Text style={styles.restoreButtonText}>購入を復元する</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 16, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textLight, marginTop: 4, lineHeight: 18 },
  planCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.divider,
    position: 'relative',
  },
  planHighlight: { borderColor: 'rgba(255,107,157,0.3)', backgroundColor: 'rgba(255,107,157,0.04)' },
  planSelected: { borderColor: Colors.primary, borderWidth: 2.5 },
  badge: {
    position: 'absolute', top: -10, right: 20,
    backgroundColor: Colors.primary,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: Colors.white },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  planName: { fontSize: 18, fontWeight: '800', color: Colors.text },
  planPricePerDay: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  planPrice: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  features: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 14, color: Colors.text },
  legalBox: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 14,
  },
  legalText: { fontSize: 11, color: Colors.textLight, lineHeight: 17 },
  purchaseButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    minHeight: 60,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  purchaseButtonDisabled: { backgroundColor: Colors.textLight },
  purchaseButtonText: { fontSize: 17, fontWeight: '800', color: Colors.white },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    minHeight: 44,
  },
  restoreButtonText: { fontSize: 14, color: Colors.textLight },
});
