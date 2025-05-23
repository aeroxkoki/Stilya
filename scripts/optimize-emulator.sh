#!/bin/bash

echo "=== Androidエミュレーター最適化スクリプト ==="
echo ""

# 1. エミュレーターのパフォーマンス設定を最適化
echo "1. 以下の設定でエミュレーターを再作成してください："
echo ""
echo "【推奨設定】"
echo "- デバイス: Nexus 5X または Pixel 4a（軽量）"
echo "- API Level: 30 (Android 11) ※新しすぎるAPIは重い"
echo "- Graphics: Hardware - GLES 2.0"
echo "- RAM: 2048 MB（最小限）"
echo "- VM heap: 128 MB"
echo "- Internal Storage: 2048 MB"
echo "- SDカード: なし"
echo ""

# 2. エミュレーターの高速化設定
echo "2. AVD Managerで「Show Advanced Settings」を開いて："
echo "- Multi-Core CPU: 4（Macのコア数に応じて調整）"
echo "- Boot option: Cold boot"
echo "- Emulated Performance: Hardware"
echo ""

# 3. 不要な機能を無効化
echo "3. エミュレーター起動後の設定："
echo "- 開発者オプションを有効化"
echo "- ウィンドウアニメスケール: オフ"
echo "- トランジションアニメスケール: オフ"
echo "- アニメーター再生時間スケール: オフ"
echo ""

# 4. Macのメモリ解放
echo "4. Macのメモリを解放："
sudo purge

echo ""
echo "✅ 設定完了！新しいエミュレーターを作成してください。"
