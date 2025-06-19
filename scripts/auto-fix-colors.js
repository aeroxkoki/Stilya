#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 色のパターンを検出する正規表現
const colorPatterns = [
  /backgroundColor:\s*['"]#[0-9a-fA-F]{3,6}['"]/g,
  /color:\s*['"]#[0-9a-fA-F]{3,6}['"]/g,
  /borderColor:\s*['"]#[0-9a-fA-F]{3,6}['"]/g,
  /shadowColor:\s*['"]#[0-9a-fA-F]{3,6}['"]/g,
  /tintColor:\s*['"]#[0-9a-fA-F]{3,6}['"]/g,
];

// テーマカラーマッピング
const colorMapping = {
  '#000000': 'theme.colors.primary',
  '#000': 'theme.colors.primary',
  '#ffffff': 'theme.colors.background',
  '#FFFFFF': 'theme.colors.background',
  '#fff': 'theme.colors.background',
  '#FFF': 'theme.colors.background',
  '#f5f5f5': 'theme.colors.surface',
  '#F5F5F5': 'theme.colors.surface',
  '#fafafa': 'theme.colors.surface',
  '#e5e5e5': 'theme.colors.border',
  '#E5E5E5': 'theme.colors.border',
  '#cccccc': 'theme.colors.text.disabled',
  '#CCCCCC': 'theme.colors.text.disabled',
  '#999999': 'theme.colors.text.hint',
  '#999': 'theme.colors.text.hint',
  '#666666': 'theme.colors.secondary',
  '#666': 'theme.colors.secondary',
  '#333333': 'theme.colors.text.primary',
  '#333': 'theme.colors.text.primary',
  '#1a1a1a': 'theme.colors.text.primary',
  '#4a4a4a': 'theme.colors.text.secondary',
  '#e53e3e': 'theme.colors.error',
  '#E53E3E': 'theme.colors.error',
  '#38a169': 'theme.colors.success',
  '#38A169': 'theme.colors.success',
  '#d69e2e': 'theme.colors.warning',
  '#D69E2E': 'theme.colors.warning',
  '#3182CE': 'theme.colors.status.info',
  '#eee': 'theme.colors.divider',
  '#eeeeee': 'theme.colors.divider',
  '#EEEEEE': 'theme.colors.divider',
  '#f0f0f0': 'theme.colors.surface',
  '#F0F0F0': 'theme.colors.surface',
  '#2A2A2A': 'theme.colors.text.primary',
  '#888': 'theme.colors.text.hint',
  '#888888': 'theme.colors.text.hint',
  '#444': 'theme.colors.text.secondary',
  '#444444': 'theme.colors.text.secondary',
};

// スタイルシート内でハードコーディングされた色を持つスタイルを収集
function collectStylesWithHardcodedColors(content) {
  const styleSheetMatch = content.match(/const\s+styles\s*=\s*StyleSheet\.create\s*\(([\s\S]*?)\}\);/);
  if (!styleSheetMatch) return [];

  const stylesContent = styleSheetMatch[1];
  const styleRegex = /(\w+):\s*\{([^}]+)\}/g;
  const stylesToModify = [];

  let match;
  while ((match = styleRegex.exec(stylesContent)) !== null) {
    const styleName = match[1];
    const styleContent = match[2];
    
    let hasHardcodedColor = false;
    colorPatterns.forEach(pattern => {
      if (pattern.test(styleContent)) {
        hasHardcodedColor = true;
      }
    });

    if (hasHardcodedColor) {
      stylesToModify.push(styleName);
    }
  }

  return stylesToModify;
}

// ファイルを処理する関数
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const changes = [];

  // useStyleフックがインポートされているか確認
  const hasUseStyle = content.includes('useStyle');
  const hasThemeImport = content.includes("from '@/contexts/ThemeContext'");

  // 既存のuseStyleの使用を確認
  const useStyleMatch = content.match(/const\s*{\s*theme\s*}\s*=\s*useStyle\(\)/);
  const hasThemeVariable = useStyleMatch !== null;

  // スタイルシート内でハードコーディングされた色を持つスタイルを収集
  const stylesToModify = collectStylesWithHardcodedColors(content);

  // インラインスタイルでハードコーディングされた色を動的に変更
  const inlineStyleRegex = /{([^}]*(?:backgroundColor|color|borderColor|shadowColor|tintColor):\s*['"]#[0-9a-fA-F]{3,6}['"][^}]*)}/g;
  content = content.replace(inlineStyleRegex, (match, styleContent) => {
    let modifiedContent = styleContent;
    let hasChange = false;

    colorPatterns.forEach(pattern => {
      modifiedContent = modifiedContent.replace(pattern, (colorMatch) => {
        const colorValue = colorMatch.match(/#[0-9a-fA-F]{3,6}/)[0];
        const themeColor = colorMapping[colorValue] || colorMapping[colorValue.toUpperCase()];
        
        if (themeColor) {
          const property = colorMatch.split(':')[0].trim();
          hasChange = true;
          changes.push({ old: colorMatch, new: `${property}: ${themeColor}` });
          return `${property}: ${themeColor}`;
        }
        return colorMatch;
      });
    });

    if (hasChange) {
      modified = true;
    }
    return `{${modifiedContent}}`;
  });

  // useStyleフックを追加する必要がある場合
  if (modified && !hasThemeVariable) {
    // インポートを追加
    if (!hasThemeImport) {
      const lastImportMatch = content.match(/(import[^;]+from[^;]+;)(?![\s\S]*import[^;]+from)/);
      if (lastImportMatch) {
        const insertPosition = content.indexOf(lastImportMatch[0]) + lastImportMatch[0].length;
        content = content.slice(0, insertPosition) + 
                  "\nimport { useStyle } from '@/contexts/ThemeContext';" + 
                  content.slice(insertPosition);
      }
    }

    // コンポーネント内でuseStyleフックを追加
    const componentMatch = content.match(/(const\s+\w+(?::\s*React\.FC(?:<[^>]+>)?)?)\s*=\s*(?:\([^)]*\)|[^=])\s*=>\s*{/);
    if (componentMatch) {
      const insertPosition = content.indexOf(componentMatch[0]) + componentMatch[0].length;
      content = content.slice(0, insertPosition) + 
                "\n  const { theme } = useStyle();" + 
                content.slice(insertPosition);
    }
  }

  if (modified) {
    // ファイルを保存
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath} (${changes.length} changes)`);
    return { success: true, changes: changes.length };
  }

  return { success: false, changes: 0 };
}

// srcディレクトリ内のすべてのTypeScript/TypeScript Reactファイルを取得
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('__')) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// メイン処理
function main() {
  const srcDir = path.join(__dirname, '..', 'src');
  const files = getAllFiles(srcDir);
  
  console.log(`🎨 Auto-fixing hardcoded colors in ${files.length} files...\n`);

  let totalFixed = 0;
  let totalChanges = 0;

  // theme.tsファイルは除外
  const filesToProcess = files.filter(f => !f.includes('theme.ts'));

  filesToProcess.forEach(file => {
    const result = processFile(file);
    if (result.success) {
      totalFixed++;
      totalChanges += result.changes;
    }
  });

  console.log(`\n✨ Summary:`);
  console.log(`  Files fixed: ${totalFixed}`);
  console.log(`  Total changes: ${totalChanges}`);
  console.log(`\n🎉 Done! All hardcoded colors have been replaced with theme colors.`);
}

// スクリプトを実行
main();
