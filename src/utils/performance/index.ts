// パフォーマンス最適化ユーティリティのエントリーポイント
import { Platform, InteractionManager } from 'react-native';
import { useCallback, useMemo } from 'react';

export * from './metrics';
export * from './memory';

// パフォーマンスモニタリングのバージョン情報
export const PERFORMANCE_UTILS_VERSION = '1.1.0';

/**
 * FlatListやSectionListの最適化設定
 * スクロールパフォーマンスを向上させる
 */
export const optimizedListProps = {
  removeClippedSubviews: true,
  maxToRenderPerBatch: 10,
  updateCellsBatchingPeriod: 50,
  windowSize: 10,
  initialNumToRender: 6,
  // ローエンドデバイスならさらに制限する
  ...(Platform.OS === 'android' && Platform.Version < 24 ? {
    maxToRenderPerBatch: 5,
    windowSize: 5,
    initialNumToRender: 3,
  } : {}),
};

/**
 * 重い計算を非同期で行うユーティリティ
 * @param compute 計算を行う関数
 * @param onResult 結果を受け取るコールバック
 */
export const computeAsync = <T>(
  compute: () => T, 
  onResult: (result: T) => void
): void => {
  InteractionManager.runAfterInteractions(() => {
    try {
      const result = compute();
      onResult(result);
    } catch (error) {
      console.error('Async computation error:', error);
    }
  });
};

/**
 * メモ化されたコールバックを生成
 * @param callback メモ化するコールバック関数
 * @param deps 依存配列
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

/**
 * 複雑な計算結果をメモ化するフック
 * @param factory 計算を行う関数
 * @param deps 依存配列
 */
export function useComputedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(() => factory(), deps);
}
