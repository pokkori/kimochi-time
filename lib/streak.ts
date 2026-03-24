import AsyncStorage from '@react-native-async-storage/async-storage';
import { isFreezeActiveAsync } from './streakFreeze';

const STREAK_KEY = '@kimochi/streak_days';
const STREAK_DATE_KEY = '@kimochi/streak_last_date';
const LONGEST_KEY = '@kimochi/streak_longest';

export async function updateStreakAsync(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = await AsyncStorage.getItem(STREAK_DATE_KEY);
  const streakStr = await AsyncStorage.getItem(STREAK_KEY);
  const longestStr = await AsyncStorage.getItem(LONGEST_KEY);
  let streak = streakStr ? parseInt(streakStr, 10) : 0;
  let longest = longestStr ? parseInt(longestStr, 10) : 0;

  if (lastDate === today) {
    return streak;
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (lastDate === yesterday) {
    streak += 1;
  } else if (lastDate) {
    streak = 1;
  } else {
    streak = 1;
  }

  if (streak > longest) {
    longest = streak;
    await AsyncStorage.setItem(LONGEST_KEY, String(longest));
  }

  await AsyncStorage.setItem(STREAK_KEY, String(streak));
  await AsyncStorage.setItem(STREAK_DATE_KEY, today);

  return streak;
}

export async function getStreakAsync(): Promise<{ current: number; longest: number }> {
  const streakStr = await AsyncStorage.getItem(STREAK_KEY);
  const longestStr = await AsyncStorage.getItem(LONGEST_KEY);
  const lastDate = await AsyncStorage.getItem(STREAK_DATE_KEY);

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let current = streakStr ? parseInt(streakStr, 10) : 0;

  // 昨日も今日も送信がなければストリーク失効（フリーズ中は除外）
  if (lastDate && lastDate !== today && lastDate !== yesterday) {
    const freezeActive = await isFreezeActiveAsync();
    if (!freezeActive) {
      current = 0;
      await AsyncStorage.setItem(STREAK_KEY, '0');
    }
  }

  return {
    current,
    longest: longestStr ? parseInt(longestStr, 10) : 0,
  };
}

export function shouldShowStreakMilestone(streak: number): boolean {
  return streak > 0 && [3, 7, 14, 30, 60, 100].includes(streak);
}
