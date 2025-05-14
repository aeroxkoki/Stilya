#!/bin/bash

echo "🧹 Cleaning up node_modules..."
rm -rf node_modules

echo "🧹 Cleaning up yarn cache..."
yarn cache clean

echo "📦 Reinstalling dependencies..."
yarn install

echo "✅ Dependencies reinstalled. Running basic test..."
yarn jest simple.test.js