import { InteractionManager } from 'react-native';
import { useRef, useEffect } from 'react';

// パフォーマンストラッキングデータ
type PerformanceMetric = {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
};

// グローバルに保持するメトリクス（開発モードでのみ使用）
const metrics: PerformanceMetric[] = [];

/**
 * パフォーマンスメトリクスの記録を開始
 * @param name メトリクス名
 * @param metadata 追加情報
 * @returns メトリクスID
 */
export const startMeasure = (name: string, metadata?: Record<string, any>): string => {
  // 本番環境では計測しない
  if (!__DEV__) return '';

  const id = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  
  metrics.push({
    name,
    startTime: performance.now(),
    metadata
  });
  
  return id;
};

/**
 * パフォーマンスメトリクスの記録を終了
 * @param id メトリクスID
 * @returns 計測結果（ミリ秒）
 */
export const endMeasure = (id: string): number => {
  // 本番環境では計測しない
  if (!__DEV__ || !id) return 0;

  const index = metrics.findIndex(metric => 
    metric.name === id.split('-')[0] && !metric.endTime
  );
  
  if (index === -1) return 0;
  
  const endTime = performance.now();
  const duration = endTime - metrics[index].startTime;
  
  metrics[index] = {
    ...metrics[index],
    endTime,
    duration
  };

  console.log(`[PERF] ${metrics[index].name}: ${duration.toFixed(2)}ms`);
  
  return duration;
};

/**
 * 特定の処理のパフォーマンスを計測する
 * @param callback 実行する関数
 * @param name メトリック名
 * @returns 関数の戻り値
 */
export const measure = <T>(callback: () => T, name: string): T => {
  if (!__DEV__) return callback();
  
  const id = startMeasure(name);
  const result = callback();
  endMeasure(id);
  
  return result;
};

/**
 * 非同期処理のパフォーマンスを計測する
 * @param callback 実行する非同期関数
 * @param name メトリック名
 * @returns Promise
 */
export const measureAsync = async <T>(
  callback: () => Promise<T>,
  name: string
): Promise<T> => {
  if (!__DEV__) return callback();

  const id = startMeasure(name);
  try {
    const result = await callback();
    endMeasure(id);
    return result;
  } catch (error) {
    endMeasure(id);
    throw error;
  }
};

/**
 * すべてのメトリクスをクリア
 */
export const clearMetrics = (): void => {
  if (!__DEV__) return;
  metrics.length = 0;
};

/**
 * すべてのメトリクスを取得
 */
export const getAllMetrics = (): PerformanceMetric[] => {
  if (!__DEV__) return [];
  return [...metrics];
};

/**
 * コンポーネントのレンダリング時間を計測するカスタムフック
 * @param componentName コンポーネント名
 */
export const useRenderMeasure = (componentName: string): void => {
  const renderCount = useRef(0);
  const lastRender = useRef(performance.now());

  useEffect(() => {
    if (!__DEV__) return;

    const currentTime = performance.now();
    const renderTime = currentTime - lastRender.current;
    
    renderCount.current += 1;

    // UIスレッドをブロックしないようにする
    InteractionManager.runAfterInteractions(() => {
      console.log(
        `[RENDER] ${componentName} rendered in ${renderTime.toFixed(2)}ms (count: ${renderCount.current})`
      );
    });
    
    lastRender.current = currentTime;
  });
};

/**
 * アプリ起動時間を記録
 */
export const recordAppStartupTime = (): void => {
  if (!__DEV__) return;
  
  // アプリ全体の起動時間を計測
  const startupTime = performance.now();
  
  InteractionManager.runAfterInteractions(() => {
    const totalTime = performance.now() - startupTime;
    console.log(`[STARTUP] App is interactive in ${totalTime.toFixed(2)}ms`);
    
    metrics.push({
      name: 'AppStartup',
      startTime: 0,
      endTime: totalTime,
      duration: totalTime
    });
  });
};
