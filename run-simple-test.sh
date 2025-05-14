#!/bin/bash

# Jest のキャッシュをクリア
rm -rf node_modules/.cache/jest

# jsdomが依存を解決できるように明示的に NODE_OPTIONS を設定
export NODE_OPTIONS=--no-warnings

# 単純なテスト実行
npx jest --config jest.config.js simple.test.js
