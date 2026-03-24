/**
 * プライバシーポリシー
 */
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Colors } from '../../constants/colors';

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>プライバシーポリシー</Text>
      <Text style={styles.updated}>最終更新: 2026年3月24日</Text>

      <Text style={styles.section}>1. 収集する情報</Text>
      <Text style={styles.body}>
        キモチタイムは以下の情報を収集します。{'\n'}
        ・感情データ（1〜9の数値・任意コメント・送信日時）{'\n'}
        ・ユーザーID（匿名UUIDまたはApple/Google認証）{'\n'}
        ・デバイス情報（クラッシュ解析のみ）{'\n'}
        ・プッシュ通知トークン（通知送信のため）
      </Text>

      <Text style={styles.section}>2. 利用目的</Text>
      <Text style={styles.body}>
        収集した情報は以下の目的にのみ使用します。{'\n'}
        ・パートナーへの感情共有機能の提供{'\n'}
        ・感情グラフ・AI分析レポートの生成{'\n'}
        ・プッシュ通知の送信{'\n'}
        ・サービス改善・不正利用防止
      </Text>

      <Text style={styles.section}>3. データの暗号化と保護</Text>
      <Text style={styles.body}>
        感情データはSupabase（AWS基盤）に暗号化された状態で保存されます。
        通信は全てTLS 1.3以上で暗号化されます。
        パートナー以外の第三者がお客様の感情データを閲覧することはありません。
      </Text>

      <Text style={styles.section}>4. 第三者への情報提供</Text>
      <Text style={styles.body}>
        以下の場合を除き、第三者への情報提供は行いません。{'\n'}
        ・法令に基づく開示要求{'\n'}
        ・お客様の同意がある場合{'\n\n'}
        ・AdMob（Google LLC）: 広告配信のための匿名デバイス識別情報{'\n'}
        ・RevenueCat, Inc.: サブスクリプション管理のための購入情報
      </Text>

      <Text style={styles.section}>5. データ保持期間と退会時の削除</Text>
      <Text style={styles.body}>
        アカウント削除（退会）を行った場合、30日以内に全ての個人データを完全削除します。
        感情データ・パートナー接続情報・通知トークンを含む全てのデータが対象です。
        削除は取り消すことができませんのでご注意ください。
      </Text>

      <Text style={styles.section}>6. お子様のプライバシー</Text>
      <Text style={styles.body}>
        本サービスは12歳以上を対象としています。
        12歳未満のお子様の個人情報を意図して収集することはありません。
      </Text>

      <Text style={styles.section}>7. お問い合わせ</Text>
      <Text style={styles.body}>
        プライバシーに関するお問い合わせ:{'\n'}
        support@kimochijam.app
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
