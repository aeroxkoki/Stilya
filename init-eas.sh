#!/bin/bash
# このスクリプトはEASの初期化を行います

# プロジェクトディレクトリに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# EASへのログイン（既にログイン済みであればスキップされます）
npx eas login

# プロジェクトの初期化 - 現在のコマンド構文に合わせて修正
npx eas init --non-interactive

# ビルドプロファイルの設定を確認
npx eas build:configure

echo "EAS初期化完了"
