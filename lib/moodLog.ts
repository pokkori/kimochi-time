/**
 * ムードログ管理（差別化機能: リアルタイム感情共有・シンクログラフ用）
 * 既存の emotionStorage.ts（9段階感情）とは独立したストレージキーを使用
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOOD_LOGS_KEY = '@kimochi/mood_logs_v2';
const PARTNER_MOOD_LOGS_KEY = '@kimochi/partner_mood_logs_v2';

export interface MoodEntry {
  id: string;
  userId: 'self' | 'partner';
  moodId: string;
  timestamp: string; // ISO 8601
  note?: string;
}

// ─── 自分のムード送信 ─────────────────────────────────────────

/** 今日の気持ちを送信してローカル保存 */
export async function saveMoodEntryAsync(
  moodId: string,
  note?: string,
): Promise<MoodEntry> {
  const existing = await getSelfMoodLogsAsync();
  const entry: MoodEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: 'self',
    moodId,
    timestamp: new Date().toISOString(),
    note,
  };
  const updated = [entry, ...existing].slice(0, 200);
  await AsyncStorage.setItem(MOOD_LOGS_KEY, JSON.stringify(updated));
  return entry;
}

export async function getSelfMoodLogsAsync(): Promise<MoodEntry[]> {
  const raw = await AsyncStorage.getItem(MOOD_LOGS_KEY);
  return raw ? (JSON.parse(raw) as MoodEntry[]) : [];
}

/** 過去N日分の自分のムードログ */
export async function getRecentMoodEntriesAsync(days: number): Promise<MoodEntry[]> {
  const logs = await getSelfMoodLogsAsync();
  const since = new Date(Date.now() - days * 86400000).toISOString();
  return logs.filter((l) => l.timestamp >= since);
}

// ─── パートナームード（Supabase Realtime接続前はローカルデモ） ─

/** パートナーのムードをローカルに保存（Supabase webhook受信時に呼び出し） */
export async function savePartnerMoodEntryAsync(
  moodId: string,
  note?: string,
): Promise<MoodEntry> {
  const existing = await getPartnerMoodLogsAsync();
  const entry: MoodEntry = {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: 'partner',
    moodId,
    timestamp: new Date().toISOString(),
    note,
  };
  const updated = [entry, ...existing].slice(0, 200);
  await AsyncStorage.setItem(PARTNER_MOOD_LOGS_KEY, JSON.stringify(updated));
  return entry;
}

export async function getPartnerMoodLogsAsync(): Promise<MoodEntry[]> {
  const raw = await AsyncStorage.getItem(PARTNER_MOOD_LOGS_KEY);
  return raw ? (JSON.parse(raw) as MoodEntry[]) : [];
}

// ─── シンクロ率計算 ─────────────────────────────────────────

/**
 * シンクロ率: 自分とパートナーの同日ムードが一致した日の割合
 * 一致 = 同じ moodId / 近い感情カテゴリ（ポジティブ同士・ネガティブ同士）
 */
export async function calculateSyncRateAsync(days: number): Promise<number> {
  const selfLogs = await getRecentMoodEntriesAsync(days);
  const partnerLogs = await getPartnerMoodLogsAsync();

  // 日付ごとに最新1件ずつ
  const selfByDate = groupByDate(selfLogs);
  const partnerByDate = groupByDate(partnerLogs);

  const selfDates = Object.keys(selfByDate);
  if (selfDates.length === 0) return 0;

  // パートナーデータがない場合はデモ値を返す
  if (partnerByDate && Object.keys(partnerByDate).length === 0) {
    // デモ: ローカルの自分のログを使ってシンクロ率を算出（β版表示用）
    return selfDates.length >= 3 ? 68 : 0;
  }

  let matchCount = 0;
  for (const date of selfDates) {
    const selfMood = selfByDate[date];
    const partnerMood = partnerByDate[date];
    if (!partnerMood) continue;
    if (isSyncMatch(selfMood, partnerMood)) matchCount++;
  }

  const daysWithBothData = selfDates.filter((d) => partnerByDate[d]).length;
  if (daysWithBothData === 0) return 0;
  return Math.round((matchCount / daysWithBothData) * 100);
}

function groupByDate(logs: MoodEntry[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const log of logs) {
    const date = log.timestamp.slice(0, 10);
    if (!map[date]) map[date] = log.moodId; // 最初 = 最新
  }
  return map;
}

/** ポジティブ感情グループ定義 */
const POSITIVE_MOODS = new Set(['happy', 'love', 'calm', 'excited']);
const NEGATIVE_MOODS = new Set(['tired', 'anxious', 'sad', 'angry']);

function isSyncMatch(moodA: string, moodB: string): boolean {
  if (moodA === moodB) return true;
  // 同カテゴリ（ポジティブ同士・ネガティブ同士）も部分一致とみなす
  if (POSITIVE_MOODS.has(moodA) && POSITIVE_MOODS.has(moodB)) return true;
  if (NEGATIVE_MOODS.has(moodA) && NEGATIVE_MOODS.has(moodB)) return true;
  return false;
}

// ─── 週次集計 ────────────────────────────────────────────────

/** 過去7日のムードID別日数集計 */
export async function getWeeklyMoodStatsAsync(): Promise<Record<string, number>> {
  const logs = await getRecentMoodEntriesAsync(7);
  const stats: Record<string, number> = {};
  for (const log of logs) {
    stats[log.moodId] = (stats[log.moodId] ?? 0) + 1;
  }
  return stats;
}

/** 最も多く共有した感情 */
export async function getTopMoodAsync(days = 30): Promise<{ moodId: string; count: number } | null> {
  const logs = await getRecentMoodEntriesAsync(days);
  if (logs.length === 0) return null;
  const stats: Record<string, number> = {};
  for (const log of logs) {
    stats[log.moodId] = (stats[log.moodId] ?? 0) + 1;
  }
  const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
  return { moodId: sorted[0][0], count: sorted[0][1] };
}

// ─── カレンダー用データ ───────────────────────────────────────

export interface DaySyncStatus {
  date: string;       // YYYY-MM-DD
  selfMoodId: string | null;
  partnerMoodId: string | null;
  isSynced: boolean;
}

/** 過去N日のカレンダー同期状態一覧 */
export async function getDaySyncStatusListAsync(days: number): Promise<DaySyncStatus[]> {
  const selfLogs = await getRecentMoodEntriesAsync(days);
  const partnerLogs = await getPartnerMoodLogsAsync();
  const selfByDate = groupByDate(selfLogs);
  const partnerByDate = groupByDate(partnerLogs);

  const result: DaySyncStatus[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const selfMoodId = selfByDate[date] ?? null;
    const partnerMoodId = partnerByDate[date] ?? null;
    result.push({
      date,
      selfMoodId,
      partnerMoodId,
      isSynced:
        selfMoodId !== null &&
        partnerMoodId !== null &&
        isSyncMatch(selfMoodId, partnerMoodId),
    });
  }
  return result;
}
