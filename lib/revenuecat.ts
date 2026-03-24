/**
 * RevenueCat 課金管理
 * 本番利用時は react-native-purchases をインストールして以下のコメントを解除してください。
 * npx expo install react-native-purchases
 */

const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? 'placeholder_rc_ios';
const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? 'placeholder_rc_android';

export const PRODUCT_IDS = {
  standard: 'kimochijam_standard_monthly',   // 月額480円: グラフ閲覧・分析レポート・広告非表示
  family:   'kimochijam_family_monthly',      // 月額680円: グループ拡張（最大5人）
} as const;

export type PlanId = keyof typeof PRODUCT_IDS;

/**
 * RevenueCat を初期化します（EAS Build 後に実際のSDKで置き換えてください）。
 */
export async function initRevenueCatAsync(userId?: string): Promise<void> {
  // TODO: Purchases.configure({ apiKey: Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID });
  // if (userId) await Purchases.logIn(userId);
  console.info('[RevenueCat] init (stub) userId=', userId);
}

/**
 * 指定プランを購入します（スタブ実装）。
 * 本番では Purchases.purchaseStoreProduct(product) を呼び出してください。
 */
export async function purchasePlanAsync(planId: PlanId): Promise<boolean> {
  // TODO: 実際の購入フローを実装
  console.info('[RevenueCat] purchasePlan (stub)', planId);
  return false;
}

/**
 * 購入を復元します（スタブ実装）。
 */
export async function restorePurchasesAsync(): Promise<boolean> {
  console.info('[RevenueCat] restorePurchases (stub)');
  return false;
}

/**
 * 現在のサブスクリプション状態を確認します（スタブ実装）。
 * isStandard: 月額480円プランが有効
 * isFamily:   月額680円プランが有効
 */
export async function getSubscriptionStatusAsync(): Promise<{
  isStandard: boolean;
  isFamily: boolean;
}> {
  // TODO: Purchases.getCustomerInfo() で実際の状態を取得
  return { isStandard: false, isFamily: false };
}
