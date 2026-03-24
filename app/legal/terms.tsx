/**
 * 利用規約
 */
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Colors } from '../../constants/colors';

export default function TermsScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>利用規約</Text>
      <Text style={styles.updated}>最終更新: 2026年3月24日</Text>

      <Text style={styles.section}>第1条（目的）</Text>
      <Text style={styles.body}>
        本規約は、キモチタイム（以下「本サービス」）の利用条件を定めるものです。
        ユーザーは本規約に同意した上でご利用ください。
      </Text>

      <Text style={styles.section}>第2条（利用資格）</Text>
      <Text style={styles.body}>
        本サービスは12歳以上の方を対象としています。
        12歳未満の方は保護者の同意が必要です。
      </Text>

      <Text style={styles.section}>第3条（禁止事項）</Text>
      <Text style={styles.body}>
        以下の行為を禁止します。{'\n'}
        ・スパム・嫌がらせ目的での感情送信{'\n'}
        ・他者のアカウントへの不正アクセス{'\n'}
        ・本サービスを利用した詐欺・違法行為{'\n'}
        ・リバースエンジニアリング
      </Text>

      <Text style={styles.section}>第4条（サービスの変更・停止）</Text>
      <Text style={styles.body}>
        運営者は事前通知なくサービス内容の変更・停止を行う場合があります。
        重大な変更については事前にアプリ内でお知らせします。
      </Text>

      <Text style={styles.section}>第5条（有料サービス）</Text>
      <Text style={styles.body}>
        スタンダードプラン（月額480円）およびファミリープラン（月額680円）は
        App Store / Google Play を通じて提供されます。{'\n'}
        サブスクリプションは自動更新されます。解約は各ストアのサブスクリプション管理から
        次回更新日の24時間前までに行ってください。{'\n\n'}
        ・初回購入から翌月以降同額が請求されます{'\n'}
        ・解約後は次回更新日まで有料機能をご利用いただけます{'\n'}
        ・デジタルコンテンツの性質上、原則として返金はできません
      </Text>

      <Text style={styles.section}>第6条（AI機能の利用）</Text>
      <Text style={styles.body}>
        本サービスの感情分析レポート機能にはAnthropic（Claude）のAIを使用しています。
        AIが生成するレポートは参考情報であり、医療的診断・治療の代替ではありません。
      </Text>

      <Text style={styles.section}>第7条（免責事項）</Text>
      <Text style={styles.body}>
        運営者は、本サービスの利用によって生じた損害について、
        法令で定める場合を除き責任を負いません。
      </Text>

      <Text style={styles.section}>第8条（準拠法・管轄）</Text>
      <Text style={styles.body}>
        本規約は日本法に準拠します。紛争については東京地方裁判所を専属管轄とします。
      </Text>

      <Text style={styles.body} style={[styles.body, { marginTop: 20 }]}>
        お問い合わせ: support@kimochijam.app
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  updated: { fontSize: 11, color: Colors.textLight, marginBottom: 20 },
  section: { fontSize: 14, fontWeight: '700', color: Colors.primary, marginTop: 20, marginBottom: 8 },
  body: { fontSize: 14, color: Colors.text, lineHeight: 22 },
});
