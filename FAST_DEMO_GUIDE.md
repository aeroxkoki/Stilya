# Stilya 高速デモ環境セットアップ

## 🎯 最速でデモを実行する方法（優先順）

### 1. 実機テスト（強く推奨） - 1分で開始可能
```bash
cd /Users/koki_air/Documents/GitHub/Stilya
npx expo start --clear
```
- スマートフォンで「Expo Go」アプリをインストール
- QRコードをスキャンするだけ
- **メリット**: 最速、実際のパフォーマンス、リアルなUX

### 2. Web版として一時的に実行（開発時のみ）
```bash
# Webブラウザで確認（モバイルビューで表示）
npx expo start --web
```
- Chrome DevToolsでモバイルビューに切り替え（Cmd+Opt+M）
- **メリット**: 即座に確認可能、リロードが高速
- **注意**: 一部のネイティブ機能は動作しない

### 3. 軽量Androidエミュレーター設定
**新規作成時の設定**:
```
デバイス: Nexus 5X（軽量）
API: 28 (Android 9.0) ※古いAPIの方が軽い
Graphics: Software
RAM: 1536 MB
CPU Cores: 2
```

### 4. パフォーマンス改善コマンド
```bash
# Metroバンドラーのキャッシュクリア
npx react-native start --reset-cache

# 開発モードを無効化（本番相当の速度）
npx expo start --no-dev --minify
```

## 📊 パフォーマンス比較

| 環境 | 起動時間 | 操作レスポンス | 推奨度 |
|------|----------|----------------|--------|
| 実機 | 10秒 | 即座 | ★★★★★ |
| Web | 5秒 | 良好 | ★★★★☆ |
| 軽量エミュレーター | 30秒 | 普通 | ★★★☆☆ |
| 標準エミュレーター | 2分 | 重い | ★☆☆☆☆ |

## 🔥 今すぐデモを始める

1. **実機を使う場合**（推奨）:
   - iPhone/AndroidにExpo Goをインストール
   - `npx expo start` → QRコードスキャン
   
2. **PCだけで確認する場合**:
   - `npx expo start --web`
   - ブラウザでモバイルビューに切り替え

## トラブルシューティング

**「Metro bundler is not running」エラー**:
```bash
npx expo start --clear
```

**接続できない場合**:
```bash
# トンネル経由で接続
npx expo start --tunnel
```

**それでも重い場合**:
- Macを再起動
- 他のアプリを終了
- Android Studioを閉じる
