# 🚨 修正手順（HelloWorldターゲット）

## Xcodeでの正確な場所

```
Xcodeの画面構成：
┌─────────────┬──────────────────────────┬────────────┐
│             │      プロジェクト設定     │            │
│  左側       │  ┌─────────────────────┐ │   右側     │
│             │  │ PROJECT              │ │            │
│  📁Stilya   │  │   Stilya            │ │  詳細設定  │
│     📄...   │  │                     │ │            │
│     📂...   │  │ TARGETS             │ │            │
│             │  │  ⚙️HelloWorld ← これ │ │            │
└─────────────┴──┴─────────────────────┴─┴────────────┘
```

## 手順

1. **青いプロジェクトアイコン（Stilya）をクリック**

2. **TARGETS の下の「HelloWorld」をクリック**
   - ⚠️ 「Stilya」という名前のターゲットはありません
   - 「HelloWorld」が正しいターゲットです

3. **General タブで修正**
   | 項目 | 現在の値 | 変更後 |
   |------|----------|--------|
   | Display Name | HelloWorld | Stilya |
   | Bundle Identifier | org.name.HelloWorld | com.aeroxkoki.stilya |

4. **Signing & Capabilities タブ**
   - ☑️ Automatically manage signing
   - Team: [あなたの名前] (Personal Team)

## 確認方法

修正後、エラーメッセージが消えて以下のような表示になればOK：
```
✅ Provisioning Profile: Xcode Managed Profile
✅ Signing Certificate: Apple Development
```

## 実行

```bash
cd /Users/koki_air/Documents/GitHub/Stilya
npm run ios
```

---

**注意**: プロジェクトファイルの「HelloWorld」という名前は後で変更できますが、今は Bundle Identifier の修正を優先してください。
