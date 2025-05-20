#!/bin/bash

# Apply patch-package patches
echo "Applying patches..."
npx patch-package

# Clean caches
echo "Cleaning caches..."
rm -rf node_modules/.cache .expo/cache .metro-cache

# Run basic tests
echo "Running basic tests..."
npm run test:basic

# Run authstore tests
echo "Running authstore tests..."
npm run test:authstore

# Run all other tests
echo "Running other tests..."
npm run test:optional
