# 商品削除管理ガイド

## 概要

Stilyaプロジェクトでは、Supabaseの無料枠（500MB）内で効率的に運用するため、適切な商品削除管理が必要です。このガイドでは、自動削除機能の仕組みと使用方法について説明します。

## 削除ポリシー

### 削除優先順位

1. **非アクティブ商品**（優先度1）
   - `is_active = false`の商品
   - 即座に削除対象

2. **季節外れ商品**（優先度2）
   - 現在の季節と反対の季節タグを持つ商品
   - 例：夏に「冬」「コート」タグの商品

3. **低優先度商品**（優先度3）
   - `priority >= 5`の商品
   - ブランド優先度が低い商品

4. **古い商品**（優先度4）
   - 14日以上更新されていない商品
   - `last_synced`が古い順

### 容量管理の閾値

| 使用率 | 状態 | アクション |
|--------|------|------------|
| 0-60% | 安全 | 通常運用 |
| 60-80% | 警告 | 削除推奨、同期制限 |
| 80-90% | 危険 | 削除必須、同期停止 |
| 90%+ | 緊急 | 緊急削除実行 |

## 削除スクリプト

### 1. スマート削除マネージャー

```bash
# ドライラン（削除せずにレポートのみ）
node scripts/maintenance/smart-deletion-manager.js --dry-run

# 実際に削除
node scripts/maintenance/smart-deletion-manager.js
```

#### 機能
- 削除対象の自動識別
- 優先順位に基づく削除
- 削除前の確認レポート
- 削除履歴の保存

### 2. 緊急削除

```bash
# 容量が90%を超えた場合の緊急削除
node scripts/maintenance/emergency-deletion.js
```

#### 機能
- 即座に実行（確認なし）
- 目標容量60%まで削除
- CI環境で自動実行可能

## GitHub Actionsでの自動削除

### 定期メンテナンス

`unified-product-sync.yml`で毎日実行：

1. **容量チェック**
   - 60%以上でドライラン実行
   - 80%以上で実際に削除

2. **削除実行**
   - スマート削除マネージャーを使用
   - 優先順位に基づいて削除

3. **緊急チェック**
   - 最終容量確認
   - 90%以上で緊急削除

## 削除設定ファイル

`scripts/maintenance/deletion-policies.json`で削除ポリシーを管理：

```json
{
  "deletion_policies": {
    "automatic_deletion": {
      "enabled": true,
      "policies": [
        {
          "name": "old_products",
          "criteria": {
            "field": "last_synced",
            "condition": "older_than_days",
            "value": 14
          },
          "priority": 4
        }
      ]
    },
    "capacity_management": {
      "thresholds": {
        "warning": 60,
        "high": 80,
        "critical": 90
      }
    }
  }
}
```

## 手動操作

### 容量確認

```bash
# 現在の使用状況を確認
node scripts/monitoring/supabase-free-tier-monitor.js
```

### 削除候補の確認

```bash
# ドライランで削除候補を確認
DRY_RUN=true node scripts/maintenance/smart-deletion-manager.js
```

### 特定条件での削除

```bash
# 環境変数で条件を指定
OLD_PRODUCT_DAYS=7 node scripts/maintenance/smart-deletion-manager.js
```

## ベストプラクティス

### 1. 定期的なモニタリング
- 週1回は手動で使用状況を確認
- GitHub Actionsのレポートを確認

### 2. 優先度の管理
- 重要なブランドは低い優先度（0-2）を設定
- 季節商品は適切にタグ付け

### 3. 削除前の確認
- 本番環境では必ずドライランを実行
- 削除レポートを確認してから実行

### 4. バックアップ
- 重要な商品データは別途バックアップ
- 削除履歴は自動保存される

## トラブルシューティング

### 削除が実行されない

1. 環境変数を確認
2. ドライランモードになっていないか確認
3. 削除対象が存在するか確認

### 容量が減らない

1. 削除後に`VACUUM`を実行（手動）
2. 非アクティブ商品が残っていないか確認
3. 他のテーブルの容量を確認

### エラーが発生する

1. Supabase接続を確認
2. API制限に達していないか確認
3. ログファイルを確認

## 削除履歴

削除実行時に自動的に履歴が保存されます：

```
logs/deletion-history-[timestamp].json
```

履歴には以下が含まれます：
- 実行日時
- 削除された商品数
- 削除理由の内訳
- 使用量の変化
- サンプル商品リスト

## 関連コマンド

```bash
# 容量モニタリング
npm run monitor:capacity

# 削除実行（ドライラン）
npm run cleanup:dry-run

# 削除実行
npm run cleanup:execute

# 緊急削除
npm run cleanup:emergency
```

## セキュリティ注意事項

- 本番環境での削除は慎重に
- CI環境では`CI=true`で確認をスキップ
- Service Keyは使用しない（Anon Keyのみ）

## 今後の改善計画

1. **AI による削除提案**
   - ユーザーの興味に基づく削除
   - 売れ筋商品の保護

2. **アーカイブ機能**
   - 削除前にアーカイブ
   - 必要時に復元可能

3. **詳細な分析**
   - 削除による影響分析
   - 最適な削除タイミングの提案
