# Stilya MVP リリース準備状況

**更新日時**: 2025年6月3日  
**ステータス**: 🚀 リリース準備開始

## 📊 現在の状況

### 開発完了項目
- ✅ 全MVP機能実装完了
- ✅ ローカルテスト成功
- ✅ GitHub連携完了  
- ✅ EAS Build設定完了
- ✅ リリース準備スクリプト作成
- ✅ 初期商品データSQL作成
- ✅ プライバシーポリシー・利用規約作成

### 本日の追加対応
- ✅ `quick-release.sh` - リリース準備自動化スクリプト
- ✅ `scripts/initial-products.sql` - 30商品の初期データ
- ✅ `docs/privacy-policy.md` - プライバシーポリシー
- ✅ `docs/terms-of-service.md` - 利用規約

## 🎯 即座に実行すべきアクション

### 1. 実機テスト開始（本日中）
```bash
# クイックリリーススクリプトを実行
cd /Users/koki_air/Documents/GitHub/Stilya
./quick-release.sh

# メニューから「2) 実機テスト（トンネルモード）」を選択
```

### 2. 本番環境設定（30分）
```bash
# quick-release.shで「4) 本番環境切り替え」を選択
# 作成される.env.productionファイルを編集

EXPO_PUBLIC_SUPABASE_URL=your-production-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-key
```

### 3. 商品データ投入（1時間）
1. Supabaseダッシュボードにログイン
2. SQLエディタを開く
3. `scripts/initial-products.sql`の内容を実行
4. 30商品が正しく登録されたことを確認

### 4. EASビルド作成（本日〜明日）
```bash
# quick-release.shで「3) EASプレビュービルド作成」を選択
# iOS/Android両方のビルドを作成
```

## 📅 今週のリリーススケジュール

| 日付 | タスク | アクション | ステータス |
|------|--------|------------|------------|
| 6/3（月） | 実機テスト開始 | `./quick-release.sh`実行 | 🔴 未着手 |
| 6/4（火） | 商品データ投入 | Supabaseに30商品登録 | 🔴 未着手 |
| 6/5-6（水木） | ベータテスト | TestFlight/内部テスト配布 | 🔴 未着手 |
| 6/7-8（金土） | フィードバック対応 | バグ修正・UI調整 | 🔴 未着手 |
| 6/9-10（日月） | ストア申請準備 | スクリーンショット作成 | 🔴 未着手 |
| 6/11（火） | ストア申請 | App Store/Google Play申請 | 🔴 未着手 |

## 🚨 ブロッカーと解決策

### 実機接続エラー
**解決策**: 
- トンネルモード使用: `npx expo start --tunnel`
- または、EASビルド直接作成: `eas build --platform all --profile preview`

### LinkShare API未実装
**解決策**: 
- MVP段階では手動登録した30商品で開始
- リリース後のv1.1でAPI連携実装

## 📸 スクリーンショット準備

### 必要な画面（5枚）
1. スワイプ画面（商品表示中）
2. 商品詳細画面
3. おすすめ商品画面  
4. プロフィール画面
5. スタイル診断結果画面

### 撮影方法
```bash
# quick-release.shで「5) ストア用スクリーンショット準備」を選択
# ディレクトリが作成されるので、そこに保存
```

## ✅ ストア申請チェックリスト

### App Store Connect
- [ ] アプリ名: Stilya - あなたのパーソナルスタイリスト
- [ ] カテゴリ: ライフスタイル
- [ ] 年齢制限: 4+
- [ ] スクリーンショット: 各サイズ5枚
- [ ] 説明文: 作成済み（store_assets/README.md参照）
- [ ] プライバシーポリシーURL: https://stilya-app.com/privacy-policy
- [ ] 利用規約URL: https://stilya-app.com/terms-of-service

### Google Play Console
- [ ] アプリ名: Stilya
- [ ] カテゴリ: ライフスタイル
- [ ] コンテンツのレーティング: 全ユーザー対象
- [ ] スクリーンショット: 各デバイス2枚以上
- [ ] グラフィックアセット: フィーチャーグラフィック作成
- [ ] プライバシーポリシー: 同上

## 📞 サポート体制

- **技術的な問題**: GitHub Issues
- **ユーザーサポート**: support@stilya-app.com
- **プライバシー関連**: privacy@stilya-app.com

## 🎉 リリース目標

**目標リリース日**: 2025年6月18日頃

**初月KPI**:
- ダウンロード数: 100-500
- アクティブユーザー: 50-100
- 平均セッション時間: 3分以上
- スワイプ数/ユーザー: 20回以上

---

**重要**: 完璧を求めず、まずはリリースして実ユーザーのフィードバックを得ることが最優先です！

**次のアクション**: `./quick-release.sh`を実行して、メニューから作業を開始してください。
