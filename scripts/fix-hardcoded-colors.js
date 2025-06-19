#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
};

// ファイルを処理する関数
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let changes = [];

  // useStyleフックがインポートされているか確認
  const hasUseStyle = content.includes('useStyle');
  const hasThemeImport = content.includes("from '@/contexts/ThemeContext'");

  // 各色パターンを検出して修正
  colorPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const colorMatch = match.match(/#[0-9a-fA-F]{3,6}/);
        if (colorMatch) {
          const color = colorMatch[0];
          const themeColor = colorMapping[color] || colorMapping[color.toUpperCase()];
          
          if (themeColor) {
            const property = match.split(':')[0].trim();
            const newValue = `${property}: ${themeColor}`;
            changes.push({ old: match, new: newValue, color, themeColor });
            modified = true;
          }
        }
      });
    }
  });

  if (modified) {
    console.log(`\n📄 ${filePath}`);
    changes.forEach(change => {
      console.log(`  ❌ ${change.old}`);
      console.log(`  ✅ ${change.new}`);
    });

    // useStyleフックを追加する必要があるか確認
    if (!hasUseStyle && !hasThemeImport) {
      console.log(`  ⚠️  Need to add useStyle hook import and usage`);
    }
  }

  return { filePath, changes, needsUseStyle: modified && !hasUseStyle };
}

// srcディレクトリ内のすべてのTypeScript/TypeScript Reactファイルを取得
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('__')) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// メイン処理
function main() {
  const srcDir = path.join(__dirname, '..', 'src');
  const files = getAllFiles(srcDir);
  
  console.log(`🔍 Scanning ${files.length} files for hardcoded colors...\n`);

  const results = [];
  files.forEach(file => {
    const result = processFile(file);
    if (result.changes.length > 0) {
      results.push(result);
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`  Total files scanned: ${files.length}`);
  console.log(`  Files with hardcoded colors: ${results.length}`);
  
  const totalChanges = results.reduce((sum, r) => sum + r.changes.length, 0);
  console.log(`  Total color instances to fix: ${totalChanges}`);

  // 修正が必要なファイルのリストを出力
  if (results.length > 0) {
    console.log(`\n📝 Files that need fixing:`);
    results.forEach(r => {
      console.log(`  - ${r.filePath} (${r.changes.length} changes)`);
    });
  }
}

// スクリプトを実行
main();
