/**
 * 特定商取引法に基づく表記
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

interface RowProps { label: string; value: string }

function Row({ label, value }: RowProps) {
  return (
    <View
      style={styles.row}
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function TokushoScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>特定商取引法に基づく表記</Text>
      <Row label="販売事業者名" value="キモチタイム運営事務局（個人開発）" />
      <Row label="所在地" value="請求に応じて遅滞なく開示します" />
      <Row label="連絡先メールアドレス" value="support@kimochijam.app（対応: 平日10〜18時）" />
      <Row label="販売価格" value="スタンダードプラン: 月額480円 / ファミリープラン: 月額680円（税込）" />
      <Row label="支払い方法" value="App Store / Google Play の決済システムを通じたクレジットカード等" />
      <Row label="支払い時期" value="月次自動更新。次回更新日の24時間前までに解約しない場合、自動的に更新されます" />
      <Row label="サービス提供時期" value="購入確認後即時利用可能" />
      <Row label="返品・返金ポリシー"
        value="デジタルコンテンツの性質上、原則として返金はできません。ただし、明らかなシステム障害による場合はサポートにご相談ください。解約後は次回更新日まで引き続き有料機能をご利用いただけます。" />
      <Row label="解約方法"
        value="iOS: App Storeのサブスクリプション設定から解約 / Android: Google Playのサブスクリプション設定から解約。アプリ内「プロフィール」→「プランをアップグレード」からも設定画面に遷移できます。" />
      <Row label="動作環境" value="iOS 16.0以上 / Android 10.0以上" />

      <Text style={styles.updated}>最終更新: 2026年3月</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 48 },
  title: {
    fontSize: 18, fontWeight: '800', color: Colors.text,
    marginBottom: 20,
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    paddingVertical: 14,
    gap: 4,
  },
  label: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  value: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  updated: {
    fontSize: 11, color: Colors.textLight,
    marginTop: 24, textAlign: 'center',
  },
});
