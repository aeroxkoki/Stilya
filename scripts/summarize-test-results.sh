#!/bin/bash
# テスト結果を集約して表示するスクリプト

echo "===== テスト結果集約レポート ====="

# テスト結果ディレクトリが存在するか確認
if [ ! -d "test-results" ]; then
  echo "テスト結果ディレクトリが見つかりません。テストを先に実行してください。"
  exit 1
fi

# JUnitレポートを解析する関数
parse_junit_report() {
  local file=$1
  local label=$2
  
  if [ ! -f "$file" ]; then
    echo "$label: レポートファイルが見つかりません ($file)"
    return
  fi
  
  # XMLファイルからテスト結果を抽出（Mac/Linuxの両方で動作する方法）
  local total=$(grep -o 'tests="[0-9]*"' "$file" | head -1 | sed 's/[^0-9]*//g')
  local failures=$(grep -o 'failures="[0-9]*"' "$file" | head -1 | sed 's/[^0-9]*//g')
  local errors=$(grep -o 'errors="[0-9]*"' "$file" | head -1 | sed 's/[^0-9]*//g')
  local time=$(grep -o 'time="[0-9\.]*"' "$file" | head -1 | sed 's/[^0-9\.]*//g')
  
  # 結果がなければ0を設定
  total=${total:-0}
  failures=${failures:-0}
  errors=${errors:-0}
  time=${time:-0}
  
  # 成功したテスト数を計算
  local success=$((total - failures - errors))
  
  echo "✅ $label テスト結果:"
  echo "  - 総テスト数: $total"
  echo "  - 成功: $success"
  echo "  - 失敗: $failures"
  echo "  - エラー: $errors"
  echo "  - 実行時間: ${time}秒"
  echo ""
}

# メインテスト結果の解析
parse_junit_report "test-results/junit.xml" "メイン"

# オプションテスト結果の解析
parse_junit_report "test-results/junit-optional.xml" "オプション"

# 全体の集計
echo "📊 全体サマリー:"
total_tests=0
total_success=0
total_failures=0
total_errors=0

for file in test-results/junit*.xml; do
  if [ -f "$file" ]; then
    file_total=$(grep -o 'tests="[0-9]*"' "$file" | head -1 | sed 's/[^0-9]*//g')
    file_failures=$(grep -o 'failures="[0-9]*"' "$file" | head -1 | sed 's/[^0-9]*//g')
    file_errors=$(grep -o 'errors="[0-9]*"' "$file" | head -1 | sed 's/[^0-9]*//g')
    
    file_total=${file_total:-0}
    file_failures=${file_failures:-0}
    file_errors=${file_errors:-0}
    file_success=$((file_total - file_failures - file_errors))
    
    total_tests=$((total_tests + file_total))
    total_success=$((total_success + file_success))
    total_failures=$((total_failures + file_failures))
    total_errors=$((total_errors + file_errors))
  fi
done

echo "  - 総テスト数: $total_tests"
echo "  - 成功: $total_success"
echo "  - 失敗: $total_failures"
echo "  - エラー: $total_errors"
echo ""

if [ $total_failures -gt 0 ] || [ $total_errors -gt 0 ]; then
  echo "⚠️ 一部のテストが失敗しています。詳細なログを確認してください。"
  exit 1
else
  echo "🎉 すべてのテストが成功しました！"
  exit 0
fi
