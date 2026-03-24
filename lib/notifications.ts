import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissionAsync(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'キモチタイム',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B9D',
    });
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function scheduleDailyReminderAsync(): Promise<void> {
  const granted = await requestNotificationPermissionAsync();
  if (!granted) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  // 毎日21:00 未送信リマインダー（週3本相当: 月・水・金のみ送る設計はクライアント側では困難なため毎日に設定し頻度は1日1本に制限）
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'キモチタイム',
      body: '今日のきもちを記録しましたか？',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
    },
  });

  // 初回は穏やかなメッセージ（23:00危機通知は除外してUX改善）
  // アプリ起動直後の通知は絶対禁止（DAU-25%リスク回避）
}

export async function sendPartnerReceivedNotificationAsync(partnerName: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'キモチタイム',
      body: `${partnerName}さんから気持ちが届きました`,
      sound: true,
    },
    trigger: null,
  });
}

export async function sendStreakMilestoneNotificationAsync(streakDays: number): Promise<void> {
  const milestoneMessages: Record<number, string> = {
    3:  '3日連続！いい調子です',
    7:  '7日連続達成！ふたりの絆が深まっています',
    14: '2週間連続！素晴らしい習慣です',
    30: '30日連続達成！特別なふたりですね',
    60: '60日連続！感情を共有し続けるふたりに拍手',
    100:'100日連続達成！キモチタイム殿堂入りです',
  };
  const message = milestoneMessages[streakDays];
  if (!message) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${streakDays}日連続達成！`,
      body: message,
      sound: true,
    },
    trigger: null,
  });
}
