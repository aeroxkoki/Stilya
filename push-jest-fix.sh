#!/bin/bash

# Add all changes
git add README.md package.json .github/workflows/test.yml .github/workflows/build.yml TEST_FIX.md patches/jest-expo+50.0.0.patch scripts/fix-uuid-tests.sh scripts/patch-jest-expo.sh

# Commit changes
git commit -m "Fix: Enhance Jest setup for globalThis.expo undefined error"

# Push to GitHub
git push origin main

echo "Changes committed and pushed to GitHub."
