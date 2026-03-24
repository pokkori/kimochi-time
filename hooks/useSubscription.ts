import { useEffect, useState } from 'react';
import { getDaysSinceFirstPlayAsync } from '../lib/emotionStorage';
import { getSubscriptionStatusAsync } from '../lib/revenuecat';

export function useSubscription() {
  const [isStandard, setIsStandard] = useState(false);
  const [isFamily, setIsFamily] = useState(false);
  const [daysSinceFirst, setDaysSinceFirst] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [status, days] = await Promise.all([
        getSubscriptionStatusAsync(),
        getDaysSinceFirstPlayAsync(),
      ]);
      setIsStandard(status.isStandard);
      setIsFamily(status.isFamily);
      setDaysSinceFirst(days);
    } finally {
      setLoading(false);
    }
  }

  // 7日後グラフゲートが有効かどうか
  const isGraphGated = !isStandard && !isFamily && daysSinceFirst >= 7;
  // 無料ユーザーでも当日グラフは見られる（7日以内の場合）
  const canViewGraph = isStandard || isFamily || daysSinceFirst < 7;

  return { isStandard, isFamily, daysSinceFirst, loading, isGraphGated, canViewGraph, reload: load };
}
