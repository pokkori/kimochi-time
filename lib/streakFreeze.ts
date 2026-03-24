/**
 * ストリークフリーズ機能（Duolingo型・プレミアム特典）
 * 月1回まで使用可能。当日の感情送信がなくてもストリークを保護する。
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const FREEZE_USED_KEY = '@kimochi/streak_freeze_used_month';
const FREEZE_ACTIVE_KEY = '@kimochi/streak_freeze_active';

/** 今月のフリーズ残り回数を返す（プレミアム: 1回/月） */
export async function getFreezeRemainingAsync(): Promise<number> {
  const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const raw = await AsyncStorage.getItem(FREEZE_USED_KEY);
  if (!raw) return 1;
  const { month, used } = JSON.parse(raw) as { month: string; used: number };
  if (month !== thisMonth) return 1;
  return Math.max(0, 1 - used);
}

/** ストリークフリーズを発動する。今月の残り回数が0の場合は false を返す */
export async function activateFreezeAsync(): Promise<boolean> {
  const remaining = await getFreezeRemainingAsync();
  if (remaining <= 0) return false;

  const thisMonth = new Date().toISOString().slice(0, 7);
  const today = new Date().toISOString().slice(0, 10);

  await AsyncStorage.setItem(FREEZE_USED_KEY, JSON.stringify({ month: thisMonth, used: 1 }));
  await AsyncStorage.setItem(FREEZE_ACTIVE_KEY, today);
  return true;
}

/** 今日フリーズが有効かどうかを確認する */
export async function isFreezeActiveAsync(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(FREEZE_ACTIVE_KEY);
  if (!raw) return false;
  const today = new Date().toISOString().slice(0, 10);
  return raw === today;
}
