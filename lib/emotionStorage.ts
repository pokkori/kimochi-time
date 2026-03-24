/**
 * 感情ログのローカルストレージ管理（オフライン対応・Supabase同期前のキュー）
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmotionId } from '../constants/emotions';

const EMOTION_LOGS_KEY = '@kimochi/emotion_logs';
const SEND_COUNT_KEY = '@kimochi/send_count_total';
const SEND_COUNT_DATE_KEY = '@kimochi/send_count_date';
const DAILY_AD_COUNT_KEY = '@kimochi/daily_ad_count';
const DAILY_AD_DATE_KEY = '@kimochi/daily_ad_date';
const FIRST_PLAY_DATE_KEY = '@kimochi/first_play_date';
const ONBOARDING_DONE_KEY = '@kimochi/onboarding_done';

export interface EmotionLog {
  id: string;
  emotionId: EmotionId;
  message?: string;
  createdAt: string;
  synced: boolean;
}

export async function addEmotionLogAsync(
  emotionId: EmotionId,
  message?: string,
): Promise<EmotionLog> {
  const existing = await getEmotionLogsAsync();
  const log: EmotionLog = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    emotionId,
    message,
    createdAt: new Date().toISOString(),
    synced: false,
  };
  existing.unshift(log);
  // 最大200件保持
  const trimmed = existing.slice(0, 200);
  await AsyncStorage.setItem(EMOTION_LOGS_KEY, JSON.stringify(trimmed));
  return log;
}

export async function getEmotionLogsAsync(): Promise<EmotionLog[]> {
  const raw = await AsyncStorage.getItem(EMOTION_LOGS_KEY);
  return raw ? (JSON.parse(raw) as EmotionLog[]) : [];
}

export async function getRecentEmotionLogsAsync(days: number): Promise<EmotionLog[]> {
  const logs = await getEmotionLogsAsync();
  const since = new Date(Date.now() - days * 86400000).toISOString();
  return logs.filter((l) => l.createdAt >= since);
}

// 送信カウンタ（インタースティシャル広告頻度制御）
export async function incrementSendCountAsync(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const dateStr = await AsyncStorage.getItem(SEND_COUNT_DATE_KEY);
  let count = 0;
  if (dateStr === today) {
    const raw = await AsyncStorage.getItem(SEND_COUNT_KEY);
    count = raw ? parseInt(raw, 10) : 0;
  }
  count += 1;
  await AsyncStorage.setItem(SEND_COUNT_KEY, String(count));
  await AsyncStorage.setItem(SEND_COUNT_DATE_KEY, today);
  return count;
}

export async function getTodaySendCountAsync(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const dateStr = await AsyncStorage.getItem(SEND_COUNT_DATE_KEY);
  if (dateStr !== today) return 0;
  const raw = await AsyncStorage.getItem(SEND_COUNT_KEY);
  return raw ? parseInt(raw, 10) : 0;
}

// 1日の広告表示回数
export async function incrementDailyAdCountAsync(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const dateStr = await AsyncStorage.getItem(DAILY_AD_DATE_KEY);
  let count = 0;
  if (dateStr === today) {
    const raw = await AsyncStorage.getItem(DAILY_AD_COUNT_KEY);
    count = raw ? parseInt(raw, 10) : 0;
  }
  count += 1;
  await AsyncStorage.setItem(DAILY_AD_COUNT_KEY, String(count));
  await AsyncStorage.setItem(DAILY_AD_DATE_KEY, today);
  return count;
}

export async function getDailyAdCountAsync(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const dateStr = await AsyncStorage.getItem(DAILY_AD_DATE_KEY);
  if (dateStr !== today) return 0;
  const raw = await AsyncStorage.getItem(DAILY_AD_COUNT_KEY);
  return raw ? parseInt(raw, 10) : 0;
}

// 初回起動日（7日後グラフ有料ゲート判定用）
export async function ensureFirstPlayDateAsync(): Promise<string> {
  const existing = await AsyncStorage.getItem(FIRST_PLAY_DATE_KEY);
  if (existing) return existing;
  const today = new Date().toISOString().slice(0, 10);
  await AsyncStorage.setItem(FIRST_PLAY_DATE_KEY, today);
  return today;
}

export async function getDaysSinceFirstPlayAsync(): Promise<number> {
  const firstDate = await ensureFirstPlayDateAsync();
  const diff = Date.now() - new Date(firstDate).getTime();
  return Math.floor(diff / 86400000);
}

// オンボーディング完了フラグ
export async function setOnboardingDoneAsync(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_DONE_KEY, '1');
}

export async function isOnboardingDoneAsync(): Promise<boolean> {
  const val = await AsyncStorage.getItem(ONBOARDING_DONE_KEY);
  return val === '1';
}
