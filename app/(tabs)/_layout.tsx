import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill={color} />
    </Svg>
  );
}

function GraphIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M3 20L8 14L13 16L20 7" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3 20H21" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function HistoryIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M12 8V12L15 15" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M3.05 11a9 9 0 1 0 .5-4M3 3v4h4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill={color} opacity={0.8} />
    </Svg>
  );
}

function SyncIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" stroke={color} strokeWidth={1.8} />
      <Path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M12 8v1M12 15v1M8 12h1M15 12h1" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          tabBarAccessibilityLabel: 'ホーム画面',
        }}
      />
      <Tabs.Screen
        name="graph"
        options={{
          title: 'グラフ',
          tabBarIcon: ({ color }) => <GraphIcon color={color} />,
          tabBarAccessibilityLabel: '感情グラフ画面',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '履歴',
          tabBarIcon: ({ color }) => <HistoryIcon color={color} />,
          tabBarAccessibilityLabel: '送信履歴画面',
        }}
      />
      <Tabs.Screen
        name="sync"
        options={{
          title: 'シンクロ',
          tabBarIcon: ({ color }) => <SyncIcon color={color} />,
          tabBarAccessibilityLabel: 'シンクログラフ画面',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'プロフィール',
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
          tabBarAccessibilityLabel: 'プロフィール・設定画面',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopColor: Colors.divider,
    height: 60,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
