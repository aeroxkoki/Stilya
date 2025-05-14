#!/bin/bash

# Jest のキャッシュをクリア
rm -rf node_modules/.cache/jest

# 単純なテスト実行
npx jest --config jest.config.js src/__tests__/simple.test.js