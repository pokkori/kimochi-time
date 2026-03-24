/**
 * InviteScreen: パートナー招待（3ステップガイド）
 */
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { shareTextToLine } from '../../lib/lineShare';

function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

const STEPS = [
  { number: 1, title: '招待コードを生成', desc: 'あなた専用の6桁コードを作成します' },
  { number: 2, title: 'パートナーに共有', desc: 'LINEや口頭でコードを伝えましょう' },
  { number: 3, title: '連携完了', desc: 'パートナーがコードを入力したら完成！' },
];

export default function InviteScreen() {
  const [myCode] = useState(generateInviteCode);
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      await shareTextToLine(
        `キモチタイムに招待します！招待コード: ${myCode}\nhttps://kimochijam.app/invite/${myCode}`,
        0,
      );
    } catch { /* ignore */ }
  }

  async function handleCopyCode() {
    // Clipboard APIはexpo-clipboardが必要。スタブ実装。
    setCopied(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleConnect() {
    if (inputCode.length !== 6) {
      Alert.alert('コードを確認', '6桁の招待コードを入力してください');
      return;
    }
    // TODO: Supabase で partner_connections テーブルに登録
    Alert.alert('接続リクエスト送信', `コード「${inputCode}」の招待を送りました。相手の承認を待ちましょう。`);
    setInputCode('');
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* 3ステップガイド */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.stepsCard}>
        <Text style={styles.stepsTitle}>3ステップで連携</Text>
        {STEPS.map((step) => (
          <View key={step.number} style={styles.stepRow} accessibilityRole="text"
            accessibilityLabel={`ステップ${step.number}: ${step.title}。${step.desc}`}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{step.number}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </Animated.View>

      {/* 自分のコード */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.codeCard}>
        <Text style={styles.codeLabel}>あなたの招待コード</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{myCode}</Text>
        </View>
        <View style={styles.codeActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCopyCode}
            accessibilityRole="button"
            accessibilityLabel={copied ? 'コピーしました' : '招待コードをコピーする'}
          >
            <Text style={styles.actionButtonText}>{copied ? 'コピーしました' : 'コードをコピー'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonLine]}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="LINEでパートナーを招待する"
            accessibilityHint="LINEアプリが開いて招待メッセージを送れます"
          >
            <Text style={[styles.actionButtonText, styles.actionButtonLineText]}>LINEで共有</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* パートナーのコードを入力 */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.connectCard}>
        <Text style={styles.connectTitle}>パートナーのコードを入力</Text>
        <TextInput
          style={styles.codeInput}
          value={inputCode}
          onChangeText={(t) => setInputCode(t.toUpperCase().slice(0, 6))}
          placeholder="6桁のコード"
          placeholderTextColor={Colors.textLight}
          maxLength={6}
          autoCapitalize="characters"
          keyboardType="default"
          accessibilityLabel="パートナーの招待コードを入力してください"
          accessibilityHint="パートナーから受け取った6桁のコードを入力します"
        />
        <TouchableOpacity
          style={[styles.connectButton, inputCode.length !== 6 && styles.connectButtonDisabled]}
          onPress={handleConnect}
          disabled={inputCode.length !== 6}
          accessibilityRole="button"
          accessibilityLabel="パートナーと連携する"
          accessibilityState={{ disabled: inputCode.length !== 6 }}
        >
          <Text style={styles.connectButtonText}>連携する</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 48, gap: 16 },
  stepsCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  stepsTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNumber: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  stepNumberText: { fontSize: 14, fontWeight: '800', color: Colors.white },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  stepDesc: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  codeCard: {
    backgroundColor: Colors.glassBlur,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  codeLabel: { fontSize: 13, color: Colors.textLight, fontWeight: '600' },
  codeBox: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  codeText: { fontSize: 32, fontWeight: '900', letterSpacing: 8, color: Colors.primary },
  codeActions: { flexDirection: 'row', gap: 12, width: '100%' },
  actionButton: {
    flex: 1, backgroundColor: Colors.primary,
    borderRadius: 12, paddingVertical: 14, minHeight: 50,
    alignItems: 'center',
  },
  actionButtonLine: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  actionButtonText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  actionButtonLineText: { color: Colors.primary },
  connectCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  connectTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  codeInput: {
    borderWidth: 1.5,
    borderColor: Colors.divider,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 6,
    textAlign: 'center',
    color: Colors.text,
    minHeight: 56,
  },
  connectButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    minHeight: 56,
    alignItems: 'center',
  },
  connectButtonDisabled: { backgroundColor: Colors.textLight },
  connectButtonText: { fontSize: 16, fontWeight: '800', color: Colors.white },
});
