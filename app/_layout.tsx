import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({});

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
        <Stack.Screen name="send/index" options={{ title: '気持ちを送る', presentation: 'modal' }} />
        <Stack.Screen name="invite/index" options={{ title: 'パートナーを招待', presentation: 'modal' }} />
        <Stack.Screen name="subscribe/index" options={{ title: 'プランを選ぶ', presentation: 'modal' }} />
        <Stack.Screen name="share/index" options={{ title: '気持ちをシェア', presentation: 'modal' }} />
        <Stack.Screen name="analysis/index" options={{ title: '感情分析レポート' }} />
        <Stack.Screen name="legal/tokusho" options={{ title: '特定商取引法に基づく表記' }} />
        <Stack.Screen name="legal/privacy" options={{ title: 'プライバシーポリシー' }} />
        <Stack.Screen name="legal/terms" options={{ title: '利用規約' }} />
      </Stack>
    </>
  );
}
