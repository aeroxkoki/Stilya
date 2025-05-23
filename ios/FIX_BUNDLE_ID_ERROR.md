# 🚨 Bundle Identifier エラーの解決方法

## エラーの原因
- プロジェクトのBundle IDが `org.name.HelloWorld` のままになっている
- これを `com.stilya.app` または独自のIDに変更する必要がある

## 解決方法

### 🔧 方法1: Xcodeで手動修正（5分）

```bash
# 修正ガイドを表示
cd /Users/koki_air/Documents/GitHub/Stilya/ios
./fix-bundle-id.sh
```

**Xcodeでの手順：**

1. **プロジェクト選択**
   - 左側ナビゲーターで「Stilya」（青いアイコン）をクリック

2. **TARGETS設定**
   - 中央パネルで「TARGETS」→「Stilya」を選択

3. **General タブ**
   ```
   Display Name: Stilya
   Bundle Identifier: com.yourname.stilya
   ```
   ※ `yourname` を自分の名前に変更（例: com.tanaka.stilya）

4. **Signing & Capabilities タブ**
   - ☑️ Automatically manage signing
   - Team: [Your Name] (Personal Team)

5. **ビルドテスト**
   - Command + B でビルド確認

### 🔄 方法2: プロジェクト再生成（10分）

```bash
# 完全にクリーンな状態から再生成
cd /Users/koki_air/Documents/GitHub/Stilya
./rebuild-ios-project.sh
```

これにより：
- ✅ 正しいBundle IDでプロジェクト再生成
- ✅ 最新の設定を適用
- ✅ 既存プロジェクトはバックアップ

### 🎯 方法3: Bundle IDを一意にする

他の人も使っている可能性があるので、以下のような一意のIDを使用：

```
com.stilya.app        → com.yourname.stilya
com.stilya.app        → com.stilya.yourname
com.stilya.app        → com.github.yourname.stilya
```

例：
- com.tanaka.stilya
- com.stilya.tanaka
- com.github.aeroxkoki.stilya

## よくある質問

**Q: Bundle IDを変更してもエラーが続く**
A: Xcodeのキャッシュをクリア
```bash
cd ios
xcodebuild clean
rm -rf ~/Library/Developer/Xcode/DerivedData
```

**Q: Personal Teamが表示されない**
A: Xcode → Settings → Accounts でApple IDを追加

**Q: 証明書エラーが出る**
A: Bundle IDを完全に一意のものに変更（他の人が使っていない）

## 💡 推奨される解決手順

1. まず**方法1**（Xcodeで手動修正）を試す
2. うまくいかない場合は**方法2**（プロジェクト再生成）
3. Bundle IDは必ず一意のものを使用

---

解決したら：
```bash
cd /Users/koki_air/Documents/GitHub/Stilya
npm run ios
```
