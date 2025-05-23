# 🚀 Apple Developer Account クイックスタート

## 今すぐStilya実機テストを始める（無料・5分で完了）

### 1️⃣ Apple IDを用意
- 既存のApple IDでOK（iPhoneで使っているもの）
- なければ作成: https://appleid.apple.com

### 2️⃣ Xcodeに登録（30秒）
```bash
# Xcodeを開く
open /Applications/Xcode.app

# メニューから: Xcode → Settings → Accounts
# 「+」ボタン → Apple ID → サインイン
```

### 3️⃣ Stilyaを実機で起動（3分）
```bash
# ターミナルで実行
cd /Users/koki_air/Documents/GitHub/Stilya
npx expo run:ios --device
```

### 4️⃣ iPhoneで「信頼」を設定（初回のみ）
```
iPhone: 設定 → 一般 → VPNとデバイス管理 
→ デベロッパAPP → あなたのメール → 信頼
```

## ✅ 完了！

---

## 📊 どのアカウントが必要？

| やりたいこと | 必要なアカウント | 費用 |
|------------|--------------|-----|
| 自分のiPhoneでテスト | 無料版 | ¥0 |
| 友達にテスト版を配布 | 有料版 | ¥15,000/年 |
| App Storeに公開 | 有料版 | ¥15,000/年 |

## ❓ よくあるトラブル

### 「Team IDが見つからない」エラー
```bash
# app.config.jsを編集
ios: {
  bundleIdentifier: "com.あなたの名前.stilya.dev"
}
```

### 「証明書の有効期限切れ」（7日後）
→ 再度 `npx expo run:ios --device` を実行

### 実機が認識されない
→ USBケーブルを純正品に変更

## 📱 ヘルパースクリプト

セットアップを自動化したい場合：
```bash
./setup-apple-developer.sh
```

---

**次のステップ**: 実機でStilya動作確認ができたら、UI/UXの改善に進みましょう！
