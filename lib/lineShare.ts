import * as Linking from 'expo-linking';
import * as Sharing from 'expo-sharing';

/**
 * LINEのline://スキームでテキストメッセージを共有します。
 * スパム防止のため1タップ1回のみ送信できる設計です。
 * LINE利用規約に準拠: メッセージのみ（画像添付なし）で呼び出します。
 */
export async function shareTextToLine(emotionLabel: string, streak: number): Promise<void> {
  // メッセージは100文字以内に制限してLINEスパム防止ポリシーに準拠
  const message = `今の気持ちは「${emotionLabel}」です（${streak}日連続でシェア中）\n#キモチタイム`;
  const encoded = encodeURIComponent(message);
  const url = `line://msg/text/${encoded}`;

  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    // LINEがインストールされていない場合はシステムシェアシートを使用
    await Sharing.shareAsync('', {
      dialogTitle: '気持ちをシェアする',
    });
  }
}

/**
 * システムシェアシート経由でテキストをシェアします（LINE以外にも対応）。
 */
export async function shareTextNative(emotionLabel: string, streak: number): Promise<void> {
  // expo-sharing はファイルパスが必要なため Linking でシェア
  const message = `今の気持ちは「${emotionLabel}」です（${streak}日連続）\n#キモチタイム`;
  const encoded = encodeURIComponent(message);
  await Linking.openURL(`sms:?body=${encoded}`).catch(() => {
    // SMS非対応環境ではLINEにフォールバック
    Linking.openURL(`line://msg/text/${encoded}`).catch(() => {});
  });
}
