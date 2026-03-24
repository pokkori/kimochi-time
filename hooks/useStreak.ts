import { useEffect, useState } from 'react';
import { getStreakAsync, shouldShowStreakMilestone, updateStreakAsync } from '../lib/streak';

export function useStreak() {
  const [current, setCurrent] = useState(0);
  const [longest, setLongest] = useState(0);
  const [milestone, setMilestone] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getStreakAsync();
    setCurrent(data.current);
    setLongest(data.longest);
  }

  async function onSend() {
    const newStreak = await updateStreakAsync();
    setCurrent(newStreak);
    if (newStreak > longest) setLongest(newStreak);
    if (shouldShowStreakMilestone(newStreak)) {
      setMilestone(newStreak);
    }
    return newStreak;
  }

  function clearMilestone() {
    setMilestone(null);
  }

  return { current, longest, milestone, onSend, clearMilestone };
}
