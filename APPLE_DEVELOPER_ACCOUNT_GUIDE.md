# Apple Developer Account 取得完全ガイド

## アカウントの種類と選び方

### 1. 無料版 Apple Developer Account
**用途**：
- ✅ 自分のデバイスでの実機テスト
- ✅ 最大3台までのデバイス登録
- ✅ 7日間有効な開発証明書
- ❌ App Storeへの配布不可
- ❌ TestFlightでの配布不可

**Stilyaの開発段階**：MVP開発・個人テスト

### 2. 有料版 Apple Developer Program（年間$99）
**用途**：
- ✅ 無制限のデバイス登録（開発用100台まで）
- ✅ 1年間有効な証明書
- ✅ App Storeへの配布
- ✅ TestFlightでのベータテスト（最大10,000人）
- ✅ Push通知などの高度な機能

**Stilyaの開発段階**：ベータテスト・本番リリース

## 無料版の取得方法（今すぐ開始可能）

### ステップ1: Apple IDの準備
1. https://appleid.apple.com にアクセス
2. 既存のApple IDでサインイン、または新規作成
   - メールアドレス
   - パスワード（大文字・小文字・数字を含む8文字以上）
   - セキュリティ質問の設定

### ステップ2: Xcodeでの設定
1. **Xcodeを開く**
   ```bash
   open /Applications/Xcode.app
   ```

2. **設定画面を開く**
   - メニューバー → Xcode → Settings（または Preferences）
   - 「Accounts」タブをクリック

3. **Apple IDを追加**
   - 左下の「+」ボタンをクリック
   - 「Apple ID」を選択
   - Apple IDとパスワードを入力
   - 2ファクタ認証を完了

4. **Team設定の確認**
   - 追加したアカウントの横に「Personal Team」と表示されればOK

### ステップ3: Stilyaプロジェクトでの設定

1. **Xcodeでプロジェクトを開く**
   ```bash
   cd /Users/koki_air/Documents/GitHub/Stilya/ios
   open Stilya.xcworkspace
   ```

2. **Signing & Capabilities設定**
   - プロジェクトナビゲーターで「Stilya」を選択
   - 「Signing & Capabilities」タブを選択
   - 「Automatically manage signing」にチェック
   - Teamドロップダウンで「Your Name (Personal Team)」を選択

3. **Bundle Identifier変更**（必要な場合）
   ```
   com.yourname.stilya.dev
   ```
   ※他と重複しないユニークなIDにする

## 有料版の取得方法（本格運用時）

### ステップ1: Apple Developer Programへの登録

1. **公式サイトにアクセス**
   https://developer.apple.com/programs/

2. **「Enroll」をクリック**
   - 個人または組織を選択
   - 利用規約に同意

3. **必要情報の入力**
   
   **個人開発者の場合**：
   - 氏名（ローマ字）
   - 住所（英語表記）
   - 電話番号
   - 支払い情報（クレジットカード）

   **組織の場合**（追加で必要）：
   - D-U-N-S番号
   - 法人の正式名称
   - 代表者情報

4. **支払い**
   - 年間$99（約15,000円）
   - 自動更新設定可能

### ステップ2: 登録完了までの時間
- **個人**：即日〜24時間
- **組織**：2〜7営業日（審査あり）

### ステップ3: 開発者ポータルへのアクセス
1. https://developer.apple.com/account/ にログイン
2. 各種証明書・プロファイルの管理が可能に

## Stilyaでの実装手順

### 無料版での実機テスト

1. **デバイスの準備**
   - iPhoneをMacに接続
   - 「このコンピュータを信頼」を選択
   - Xcodeでデバイスが認識されることを確認

2. **ビルドと実行**
   ```bash
   cd /Users/koki_air/Documents/GitHub/Stilya
   npx expo run:ios --device
   ```

3. **初回実行時の設定**
   - iPhone側：設定 → 一般 → VPNとデバイス管理
   - 開発者アプリケーションを信頼

### トラブルシューティング

**「信頼されていない開発者」エラー**
```
iPhoneの設定 → 一般 → VPNとデバイス管理 → 
デベロッパAPP → "あなたのApple ID" → 信頼
```

**Bundle ID競合エラー**
```bash
# app.config.jsを編集
ios: {
  bundleIdentifier: "com.yourname.stilya.dev",
}
```

## 料金比較と推奨タイミング

| 段階 | アカウント種類 | 費用 | 推奨理由 |
|------|--------------|------|----------|
| MVP開発 | 無料版 | ¥0 | 個人テストには十分 |
| ベータテスト | 有料版 | ¥15,000/年 | TestFlight必須 |
| 本番リリース | 有料版 | ¥15,000/年 | App Store配布必須 |

## 次のステップ

### 今すぐ始める（無料版）
1. Xcodeを開いてApple IDを追加
2. プロジェクトでPersonal Teamを選択
3. 実機でテスト開始

### 本格展開時（有料版）
1. ユーザーテストの計画立案
2. Apple Developer Program登録
3. TestFlightでベータ配布

## よくある質問

**Q: 無料版で開発したアプリを後で有料版に移行できる？**
A: はい、Bundle IDを維持すれば簡単に移行できます。

**Q: 個人と組織、どちらで登録すべき？**
A: 個人開発なら個人登録で十分。法人化予定があれば最初から組織登録を推奨。

**Q: 支払い方法は？**
A: クレジットカード、デビットカード（Visa/Mastercard/JCB/Amex）

**Q: 学生割引はある？**
A: 残念ながらありません。ただし、大学のプログラムに参加している場合は無料の場合があります。

---

準備ができたら、まずは無料版でStilya実機テストを始めてみましょう！
