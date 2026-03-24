/**
 * AdMob バナー広告コンポーネント
 * 本番利用時は react-native-google-mobile-ads をインストールして以下を置き換えてください:
 * npx expo install react-native-google-mobile-ads
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AD_UNIT_IDS } from '../constants/admob';
import { Colors } from '../constants/colors';

interface Props {
  visible?: boolean;
}

export function AdBanner({ visible = true }: Props) {
  if (!visible) return null;

  // スタブ実装: AdMob SDK 接続後にバナーコンポーネントに差し替えてください
  // import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
  // return <BannerAd unitId={AD_UNIT_IDS.banner} size={BannerAdSize.BANNER} />;

  return (
    <View
      style={styles.container}
      accessibilityRole="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={styles.placeholder}>
        AdMob バナー ({AD_UNIT_IDS.banner.slice(-8)})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  placeholder: {
    fontSize: 10,
    color: Colors.textLight,
  },
});
