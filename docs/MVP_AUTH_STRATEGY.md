# MVP認証戦略ドキュメント

## 概要

Stilya MVPリリースにおける認証戦略について、段階的なアプローチを定義します。
初期はユーザー獲得を優先し、成長に応じてセキュリティを強化していく方針です。

## メール認証なし運用のメリット・デメリット

### メリット ✅

- **ユーザー体験の向上**
  - 登録後すぐにアプリを使える
  - 離脱率の大幅な削減（メール確認で30-50%が離脱）
  - シンプルな登録フロー

- **開発・運用コストの削減**
  - SMTP設定不要
  - メール送信コストなし
  - メール関連のトラブルシューティング不要

### デメリット ⚠️

- **セキュリティリスク**
  - 存在しないメールアドレスでの登録が可能
  - パスワードリセットができない
  - なりすまし登録のリスク

- **ユーザー管理の課題**
  - 重複アカウントの増加
  - 連絡手段がない

## 段階的実装計画

### フェーズ1：MVP リリース時（0〜3ヶ月）

**目標：ユーザー獲得の最大化**

- ✅ **メール認証OFF**
- ✅ **必須情報は最小限**（メール + パスワードのみ）
- ✅ **利用規約で注意喚起**
- ✅ **シンプルな登録フロー**

**Supabase設定：**
```
Authentication → Settings → Email Auth → "Enable email confirmations" をOFF
```

**セキュリティ対策：**
- レート制限の設定（1IPあたり10回/時間）
- パスワード最低6文字
- 基本的なバリデーション

### フェーズ2：成長期（ユーザー数 1,000人〜）

**目標：信頼性の向上とセキュリティ強化**

- ✅ **Google/Apple認証を追加**
- ✅ **既存ユーザーに認証を促す**（インセンティブ付き）
- ✅ **新機能をメール認証済みユーザー限定に**
- ✅ **パスワードリセット機能の限定的実装**

**実装内容：**
```javascript
// 認証状態による機能制限の例
const isPremiumFeatureAvailable = user.email_confirmed || user.provider !== 'email';
```

### フェーズ3：収益化段階（6ヶ月〜）

**目標：本格的なサービス運営**

- ✅ **メール認証を段階的に必須化**
- ✅ **カスタムSMTP設定**（SendGrid/Resend）
- ✅ **2段階認証オプション**
- ✅ **アカウント統合機能**

## 実装チェックリスト

### 即座に実施

- [ ] Supabaseでメール認証を無効化
- [ ] 利用規約に認証ポリシーを明記
- [ ] テストアカウントの作成と動作確認

### MVP リリース前

- [ ] レート制限の実装
- [ ] エラーメッセージの最適化
- [ ] 登録フローのA/Bテスト準備

### リリース後1ヶ月以内

- [ ] ユーザー登録率の分析
- [ ] 無効メールアドレスの割合測定
- [ ] SNS認証の実装準備

## 利用規約への記載例

```
【アカウント登録について】
- 本サービスでは、迅速なサービス提供のため、登録時のメールアドレス確認を省略しています。
- 正確なメールアドレスの入力をお願いします。誤ったメールアドレスでは、パスワードリセット等のサービスが利用できません。
- 将来的にメールアドレスの確認が必要になる場合があります。
```

## KPI設定

### フェーズ1
- 登録完了率：70%以上
- 登録〜初回スワイプ：80%以上

### フェーズ2
- メール認証率：30%以上
- SNS認証利用率：20%以上

### フェーズ3
- 全体認証率：80%以上
- セキュリティインシデント：0件

## 技術的な実装詳細

### Supabaseの設定コード例

```javascript
// src/services/supabase.ts での設定
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoConfirmEmail: true, // フェーズ1ではtrue
    enableSignUpConfirmation: false, // フェーズ1ではfalse
  }
});
```

### 認証状態の管理

```typescript
interface User {
  id: string;
  email: string;
  email_confirmed?: boolean;
  provider?: 'email' | 'google' | 'apple';
}
```

## リスク管理

### 想定されるリスクと対策

1. **大量の偽アカウント作成**
   - IP制限とレート制限で対応
   - 異常検知システムの導入（フェーズ2）

2. **ユーザーとの連絡不能**
   - アプリ内通知機能の充実
   - 任意でのメール認証を促進

3. **セキュリティインシデント**
   - 最小権限の原則
   - 定期的なセキュリティ監査

## まとめ

MVPフェーズでは**ユーザー獲得**を最優先とし、成長に応じて段階的にセキュリティを強化していく戦略を採用します。この approach により、初期の成長速度を維持しながら、持続可能なサービス運営を実現します。

---

最終更新日: 2025年1月13日
次回レビュー予定: MVPリリース後1ヶ月
