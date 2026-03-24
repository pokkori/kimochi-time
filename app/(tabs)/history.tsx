/**
 * HistoryScreen: 感情送信履歴一覧
 */
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { EMOTIONS } from '../../constants/emotions';
import { EmotionLog, getEmotionLogsAsync } from '../../lib/emotionStorage';

function LogItem({ item, index }: { item: EmotionLog; index: number }) {
  const emotion = EMOTIONS.find((e) => e.id === item.emotionId) ?? EMOTIONS[4];
  const dateObj = new Date(item.createdAt);
  const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
  const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).duration(300)}
      style={styles.logItem}
      accessibilityRole="text"
      accessibilityLabel={`${dateStr} ${timeStr} - 気分: ${emotion.label}${item.message ? ` - コメント: ${item.message}` : ''}`}
    >
      <View style={[styles.emotionChip, { backgroundColor: emotion.color }]}>
        <Text style={[styles.emotionLabel, { color: emotion.textColor }]}>
          {emotion.label}
        </Text>
      </View>
      <View style={styles.logMeta}>
        <Text style={styles.logDate}>{dateStr}</Text>
        <Text style={styles.logTime}>{timeStr}</Text>
      </View>
      {item.message && (
        <Text style={styles.logMessage} numberOfLines={1}>
          {item.message}
        </Text>
      )}
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    const data = await getEmotionLogsAsync();
    setLogs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  if (loading) return <View style={styles.root} />;

  if (logs.length === 0) {
    return (
      <View style={[styles.root, styles.empty]}>
        <Text style={styles.emptyTitle}>まだ履歴がありません</Text>
        <Text style={styles.emptyDesc}>ホーム画面から気持ちを送ってみましょう。</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <LogItem item={item} index={index} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.headerText}>{logs.length}件の記録</Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
    gap: 8,
  },
  headerText: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 8,
    fontWeight: '600',
  },
  logItem: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  emotionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 88,
    alignItems: 'center',
  },
  emotionLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  logMeta: {
    flex: 1,
  },
  logDate: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  logTime: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  logMessage: {
    fontSize: 12,
    color: Colors.textLight,
    maxWidth: 80,
  },
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
