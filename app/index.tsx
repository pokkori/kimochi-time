/**
 * エントリポイント: オンボーディング完了済みならタブ画面へ、未完了ならオンボーディングへ
 */
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { isOnboardingDoneAsync } from '../lib/emotionStorage';

export default function Index() {
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    isOnboardingDoneAsync().then((v) => {
      setDone(v);
      setReady(true);
    });
  }, []);

  if (!ready) return <View />;
  if (done) return <Redirect href="/(tabs)" />;
  return <Redirect href="/onboarding" />;
}
