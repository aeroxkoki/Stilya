#!/usr/bin/env node

/**
 * オンボーディング関連の整合性チェックスクリプト
 */

const fs = require('fs');
const path = require('path');

const issues = [];

// チェック対象のディレクトリ
const SRC_DIR = path.join(__dirname, '../src');

// オンボーディング関連のファイルパス
const ONBOARDING_FILES = {
  unifiedSwipe: path.join(SRC_DIR, 'screens/onboarding/UnifiedSwipeScreen.tsx'),
  styleReveal: path.join(SRC_DIR, 'screens/onboarding/StyleRevealScreen.tsx'),
  context: path.join(SRC_DIR, 'contexts/OnboardingContext.tsx'),
  navigator: path.join(SRC_DIR, 'navigation/OnboardingNavigator.tsx'),
  swipeCard: path.join(SRC_DIR, 'components/onboarding/OnboardingSwipeCard.tsx'),
  tutorialSwipe: path.join(SRC_DIR, 'components/onboarding/TutorialSwipeContainer.tsx'),
};

/**
 * ファイルの存在確認
 */
function checkFileExists(filePath, description) {
  if (!fs.existsSync(filePath)) {
    issues.push({
      file: filePath,
      line: 0,
      issue: `${description} ファイルが存在しません`,
      severity: 'error'
    });
    return false;
  }
  return true;
}

/**
 * インポートの整合性チェック
 */
function checkImports(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // useSharedValueの使用チェック
    if (line.includes('useSharedValue') && line.includes('useEffect')) {
      issues.push({
        file: filePath,
        line: index + 1,
        issue: 'useSharedValueをuseEffect内で使用している可能性があります',
        severity: 'warning'
      });
    }
    
    // 存在しないコンポーネントのインポート
    if (line.includes('from') && line.includes('./') && !line.includes('node_modules')) {
      const importMatch = line.match(/from\s+['"](.+)['"]/);
      if (importMatch) {
        const importPath = importMatch[1];
        const resolvedPath = path.resolve(path.dirname(filePath), importPath);
        const possiblePaths = [
          resolvedPath,
          `${resolvedPath}.ts`,
          `${resolvedPath}.tsx`,
          `${resolvedPath}/index.ts`,
          `${resolvedPath}/index.tsx`,
        ];
        
        const exists = possiblePaths.some(p => fs.existsSync(p));
        if (!exists && !importPath.includes('@/')) {
          issues.push({
            file: filePath,
            line: index + 1,
            issue: `インポートパスが解決できません: ${importPath}`,
            severity: 'error'
          });
        }
      }
    }
  });
}

/**
 * ナビゲーション設定の確認
 */
function checkNavigation() {
  const navigatorPath = ONBOARDING_FILES.navigator;
  if (!fs.existsSync(navigatorPath)) {
    issues.push({
      file: navigatorPath,
      line: 0,
      issue: 'OnboardingNavigatorが存在しません',
      severity: 'error'
    });
    return;
  }
  
  const content = fs.readFileSync(navigatorPath, 'utf-8');
  
  // 必須画面の確認
  const requiredScreens = ['UnifiedSwipe', 'StyleReveal', 'WelcomeScreen', 'GenderScreen'];
  requiredScreens.forEach(screen => {
    if (!content.includes(screen)) {
      issues.push({
        file: navigatorPath,
        line: 0,
        issue: `必須画面 ${screen} がナビゲーターに登録されていません`,
        severity: 'error'
      });
    }
  });
}

/**
 * OnboardingContextの整合性チェック
 */
function checkContext() {
  const contextPath = ONBOARDING_FILES.context;
  if (!fs.existsSync(contextPath)) {
    issues.push({
      file: contextPath,
      line: 0,
      issue: 'OnboardingContextが存在しません',
      severity: 'error'
    });
    return;
  }
  
  const content = fs.readFileSync(contextPath, 'utf-8');
  
  // 必須メソッドの確認
  const requiredMethods = [
    'setStyleQuizResults',
    'nextStep',
    'prevStep',
    'gender',
    'stylePreference',
    'ageGroup'
  ];
  
  requiredMethods.forEach(method => {
    if (!content.includes(method)) {
      issues.push({
        file: contextPath,
        line: 0,
        issue: `必須メソッド/プロパティ ${method} がContextに定義されていません`,
        severity: 'error'
      });
    }
  });
}

/**
 * カード数の整合性チェック
 */
function checkCardCount() {
  const unifiedSwipePath = ONBOARDING_FILES.unifiedSwipe;
  if (!fs.existsSync(unifiedSwipePath)) return;
  
  const content = fs.readFileSync(unifiedSwipePath, 'utf-8');
  
  // TOTAL_CARDSの定義を確認
  const totalCardsMatch = content.match(/const\s+TOTAL_CARDS\s*=\s*(\d+)/);
  if (totalCardsMatch) {
    const totalCards = parseInt(totalCardsMatch[1]);
    
    // カードアニメーションの定義数を確認（const card0Anim = ... の形式のみカウント）
    const cardAnimMatches = content.match(/const\s+card\d+Anim\s*=/g);
    if (cardAnimMatches) {
      const animCount = cardAnimMatches.length;
      if (animCount !== totalCards) {
        issues.push({
          file: unifiedSwipePath,
          line: 0,
          issue: `TOTAL_CARDS(${totalCards})とカードアニメーション数(${animCount})が一致しません`,
          severity: 'error'
        });
      }
    }
    
    // チュートリアルカードの数を確認
    if (content.includes('currentIndex < 2')) {
      const tutorialCards = 2;
      if (totalCards < tutorialCards) {
        issues.push({
          file: unifiedSwipePath,
          line: 0,
          issue: `TOTAL_CARDS(${totalCards})がチュートリアルカード数(${tutorialCards})より少ないです`,
          severity: 'error'
        });
      }
    }
  }
}

/**
 * Reanimatedの使用方法チェック
 */
function checkReanimatedUsage() {
  const unifiedSwipePath = ONBOARDING_FILES.unifiedSwipe;
  if (!fs.existsSync(unifiedSwipePath)) return;
  
  const content = fs.readFileSync(unifiedSwipePath, 'utf-8');
  const lines = content.split('\n');
  
  let inUseEffect = false;
  let braceCount = 0;
  
  lines.forEach((line, index) => {
    // useEffectの開始を検出
    if (line.includes('useEffect(')) {
      inUseEffect = true;
      braceCount = 0;
    }
    
    if (inUseEffect) {
      // 中括弧のカウント
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
      
      // useSharedValueの使用を検出
      if (line.includes('useSharedValue(')) {
        issues.push({
          file: unifiedSwipePath,
          line: index + 1,
          issue: 'useSharedValueがuseEffect内で呼び出されています（フックルール違反）',
          severity: 'error'
        });
      }
      
      // useEffectの終了
      if (braceCount <= 0) {
        inUseEffect = false;
      }
    }
  });
}

/**
 * 依存関係の確認
 */
function checkDependencies() {
  const packageJsonPath = path.join(__dirname, '../package.json');
  if (!fs.existsSync(packageJsonPath)) {
    issues.push({
      file: packageJsonPath,
      line: 0,
      issue: 'package.jsonが見つかりません',
      severity: 'error'
    });
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  // 必須パッケージの確認
  const requiredPackages = [
    'react-native-reanimated',
    'react-native-gesture-handler',
    'expo-haptics',
    '@react-navigation/native-stack'
  ];
  
  requiredPackages.forEach(pkg => {
    if (!dependencies[pkg]) {
      issues.push({
        file: packageJsonPath,
        line: 0,
        issue: `必須パッケージ ${pkg} がインストールされていません`,
        severity: 'error'
      });
    }
  });
}

/**
 * TypeScript型定義の確認
 */
function checkTypeDefinitions() {
  const typesPath = path.join(SRC_DIR, 'navigation/types.ts');
  if (!fs.existsSync(typesPath)) {
    issues.push({
      file: typesPath,
      line: 0,
      issue: 'navigation/types.ts が存在しません',
      severity: 'error'
    });
    return;
  }
  
  const content = fs.readFileSync(typesPath, 'utf-8');
  
  // OnboardingStackParamListの確認
  if (!content.includes('OnboardingStackParamList')) {
    issues.push({
      file: typesPath,
      line: 0,
      issue: 'OnboardingStackParamList型が定義されていません',
      severity: 'error'
    });
  }
  
  // 必須画面の型定義確認
  const requiredScreens = ['UnifiedSwipe', 'StyleReveal'];
  requiredScreens.forEach(screen => {
    if (!content.includes(screen)) {
      issues.push({
        file: typesPath,
        line: 0,
        issue: `画面 ${screen} の型定義がありません`,
        severity: 'warning'
      });
    }
  });
}

/**
 * メイン処理
 */
function main() {
  console.log('🔍 オンボーディング整合性チェック開始...\n');
  
  // 各種チェックを実行
  console.log('📁 ファイル存在確認...');
  Object.entries(ONBOARDING_FILES).forEach(([key, filePath]) => {
    checkFileExists(filePath, key);
  });
  
  console.log('📦 インポート整合性確認...');
  Object.values(ONBOARDING_FILES).forEach(filePath => {
    if (fs.existsSync(filePath)) {
      checkImports(filePath);
    }
  });
  
  console.log('🧭 ナビゲーション設定確認...');
  checkNavigation();
  
  console.log('🔧 Context整合性確認...');
  checkContext();
  
  console.log('🎴 カード数整合性確認...');
  checkCardCount();
  
  console.log('⚡ Reanimated使用方法確認...');
  checkReanimatedUsage();
  
  console.log('📚 依存関係確認...');
  checkDependencies();
  
  console.log('📝 型定義確認...');
  checkTypeDefinitions();
  
  // 結果表示
  console.log('\n' + '='.repeat(60));
  console.log('📊 チェック結果\n');
  
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');
  
  if (errors.length > 0) {
    console.log('❌ エラー:', errors.length);
    errors.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    ${issue.issue}`);
    });
    console.log();
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  警告:', warnings.length);
    warnings.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    ${issue.issue}`);
    });
    console.log();
  }
  
  if (infos.length > 0) {
    console.log('ℹ️  情報:', infos.length);
    infos.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    ${issue.issue}`);
    });
    console.log();
  }
  
  if (issues.length === 0) {
    console.log('✅ すべての整合性チェックをパスしました！');
  } else {
    console.log(`📝 合計: ${issues.length} 件の問題が見つかりました`);
    if (errors.length > 0) {
      console.log('\n⚠️  エラーが存在します。修正が必要です。');
      process.exit(1);
    }
  }
}

// 実行
main();
