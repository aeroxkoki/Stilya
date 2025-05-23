# Android エミュレーター設定ガイド

## 推奨設定（Expo SDK 53対応）

### デバイス仕様
- **デバイス**: Pixel 6 または Pixel 7
- **API Level**: 33 (Android 13) または 34 (Android 14)
- **RAM**: 4GB 以上（推奨）
- **VM Heap**: 256MB
- **内部ストレージ**: 4GB 以上（重要）
- **SDカード**: 512MB（オプション）

### 作成手順
1. Android Studio → Device Manager
2. 「Create Device」をクリック
3. Phone → Pixel 6 を選択 → Next
4. System Image:
   - **Recommended** タブから API 33 または 34 を選択
   - arm64-v8a を推奨（M1/M2 Macの場合）
5. AVD Name: 「Pixel_6_API_33_Stilya」など分かりやすい名前
6. Show Advanced Settings:
   - RAM: 4096 MB
   - VM heap: 256 MB
   - Internal Storage: 4096 MB
7. Finish

### エミュレーター起動時の注意
- 完全に起動するまで待つ（ホーム画面が表示されるまで）
- 初回起動時は時間がかかる（2-3分）
- Google Playサービスの更新が入る場合がある

### トラブルシューティング
- ストレージ不足エラーが出た場合は「Wipe Data」を実行
- 動作が重い場合はRAMを増やす
- M1/M2 Macの場合は必ずarm64イメージを使用
