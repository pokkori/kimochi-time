import { Platform } from 'react-native';

// PRODUCTION_MODE: false のまま審査申請。本番ID取得後に true に変更
const PRODUCTION_MODE = false;

export const AD_UNIT_IDS = {
  banner: Platform.OS === 'ios'
    ? (PRODUCTION_MODE ? 'REPLACE_WITH_PRODUCTION_BANNER_IOS' : 'ca-app-pub-3940256099942544/2934735716')
    : (PRODUCTION_MODE ? 'REPLACE_WITH_PRODUCTION_BANNER_ANDROID' : 'ca-app-pub-3940256099942544/6300978111'),
  interstitial: Platform.OS === 'ios'
    ? (PRODUCTION_MODE ? 'REPLACE_WITH_PRODUCTION_INTERSTITIAL_IOS' : 'ca-app-pub-3940256099942544/4411468910')
    : (PRODUCTION_MODE ? 'REPLACE_WITH_PRODUCTION_INTERSTITIAL_ANDROID' : 'ca-app-pub-3940256099942544/1033173712'),
};

// 感情送信7回に1回インタースティシャルを表示
export const INTERSTITIAL_INTERVAL = 7;
// 1日の最大表示回数
export const INTERSTITIAL_DAILY_LIMIT = 2;
