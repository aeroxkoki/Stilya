#!/usr/bin/env node

/**
 * スワイプ画面の整合性チェックスクリプト
 * keyの変更による影響を確認
 */

const fs = require('fs');
const path = require('path');

// 色付きコンソール出力
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}\n`)
};

// ファイルを読み込む関数
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    log.error(`Failed to read file: ${filePath}`);
    return null;
  }
}

// 整合性チェック関数
function checkConsistency() {
  log.header('スワイプ画面の整合性チェック');
  
  const issues = [];
  const warnings = [];
  
  // 1. StyledSwipeContainer.tsxのチェック
  log.info('Checking StyledSwipeContainer.tsx...');
  const containerPath = path.join(__dirname, '../src/components/swipe/StyledSwipeContainer.tsx');
  const containerContent = readFile(containerPath);
  
  if (containerContent) {
    // keyの使用確認
    if (containerContent.includes('key={`stack-${stackIndex}`}')) {
      log.success('Position-based key is correctly implemented');
    } else if (containerContent.includes('key={product.id}')) {
      issues.push('StyledSwipeContainer still uses product.id as key');
    }
    
    // currentIndexの管理確認
    if (containerContent.includes('currentIndex: externalIndex')) {
      log.success('External index management is correctly implemented');
    }
    
    // プリロード数の確認
    const preloadMatch = containerContent.match(/(\d+)\s*\/\/.*先読み/);
    if (preloadMatch && parseInt(preloadMatch[1]) === 3) {
      log.success('Preload count is optimized to 3');
    } else if (preloadMatch && parseInt(preloadMatch[1]) > 3) {
      warnings.push(`Preload count is ${preloadMatch[1]}, consider reducing to 3`);
    }
  }
  
  // 2. SwipeCardImproved.tsxのチェック
  log.info('Checking SwipeCardImproved.tsx...');
  const cardPath = path.join(__dirname, '../src/components/swipe/SwipeCardImproved.tsx');
  const cardContent = readFile(cardPath);
  
  if (cardContent) {
    // product.id依存のuseEffectの確認
    if (cardContent.includes('}, [product.id]);')) {
      log.success('Product ID dependency in useEffect is maintained');
      
      // リセット処理の確認
      if (cardContent.includes('animValues.position.setValue({ x: 0, y: 0 })')) {
        log.success('Animation reset logic is present');
      } else {
        issues.push('Animation reset logic might be missing');
      }
    } else {
      warnings.push('Product ID dependency in useEffect might be modified');
    }
    
    // React.memoの確認
    if (cardContent.includes('memo(')) {
      log.success('Component is memoized for performance');
    } else {
      warnings.push('Consider memoizing SwipeCardImproved for better performance');
    }
  }
  
  // 3. CachedImage.tsxのチェック
  log.info('Checking CachedImage.tsx...');
  const imagePath = path.join(__dirname, '../src/components/common/CachedImage.tsx');
  const imageContent = readFile(imagePath);
  
  if (imageContent) {
    // トランジション時間の確認
    const transitionMatch = imageContent.match(/transition=\{(\d+)\}/);
    if (transitionMatch && parseInt(transitionMatch[1]) <= 50) {
      log.success(`Image transition is optimized (${transitionMatch[1]}ms)`);
    } else if (transitionMatch && parseInt(transitionMatch[1]) > 50) {
      warnings.push(`Image transition is ${transitionMatch[1]}ms, consider reducing to 50ms`);
    }
    
    // placeholderの確認
    if (imageContent.includes('placeholder={fallbackSource}')) {
      log.success('Fallback placeholder is correctly set');
    }
  }
  
  // 4. imagePreloadService.tsのチェック
  log.info('Checking imagePreloadService.ts...');
  const preloadPath = path.join(__dirname, '../src/services/imagePreloadService.ts');
  const preloadContent = readFile(preloadPath);
  
  if (preloadContent) {
    // プリロード間隔の確認
    const intervalMatch = preloadContent.match(/setTimeout\(resolve,\s*(\d+)\)/);
    if (intervalMatch && parseInt(intervalMatch[1]) <= 30) {
      log.success(`Preload interval is optimized (${intervalMatch[1]}ms)`);
    } else if (intervalMatch && parseInt(intervalMatch[1]) > 30) {
      warnings.push(`Preload interval is ${intervalMatch[1]}ms, consider reducing to 30ms`);
    }
  }
  
  // 5. 潜在的な問題のチェック
  log.info('Checking for potential issues...');
  
  // StyledSwipeContainerでのproduct参照の一貫性
  if (containerContent && containerContent.includes('products[productIndex]')) {
    const productRefCount = (containerContent.match(/products\[productIndex\]/g) || []).length;
    const productDirectCount = (containerContent.match(/product\./g) || []).length;
    
    if (productRefCount > 0 && productDirectCount > 0) {
      log.success('Product references are consistent');
    } else {
      warnings.push('Check product reference consistency in StyledSwipeContainer');
    }
  }
  
  // 結果の表示
  log.header('チェック結果');
  
  if (issues.length === 0 && warnings.length === 0) {
    log.success('すべてのチェックに合格しました！整合性に問題はありません。');
  } else {
    if (issues.length > 0) {
      log.error(`${issues.length}個の問題が見つかりました:`);
      issues.forEach(issue => log.error(`  • ${issue}`));
    }
    
    if (warnings.length > 0) {
      log.warning(`${warnings.length}個の警告があります:`);
      warnings.forEach(warning => log.warning(`  • ${warning}`));
    }
  }
  
  // 推奨事項
  log.header('推奨事項');
  log.info('1. ExpoGoアプリで実際の動作を確認してください');
  log.info('2. スワイプ時の画像切り替えがスムーズか確認してください');
  log.info('3. メモリ使用量を監視してください');
  log.info('4. ネットワーク負荷が適切か確認してください');
  
  return issues.length === 0;
}

// メイン実行
const success = checkConsistency();
process.exit(success ? 0 : 1);
