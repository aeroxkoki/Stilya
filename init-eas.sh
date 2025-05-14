#!/bin/bash
# このスクリプトはEASの初期化を行います

# プロジェクトディレクトリに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# EASへのログイン（既にログイン済みであればスキップされます）
npx eas login

# プロジェクトの初期化 - 既存のプロジェクトを最新の設定で更新
npx eas project:init --id c2a98f3b-d8dc-4bc3-9b53-8ff63bc2cfd9 --non-interactive

# ビルドプロファイルの設定を確認
npx eas build:configure

echo "EAS初期化完了"
