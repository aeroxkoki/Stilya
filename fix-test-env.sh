#!/bin/bash

# Run a simple test to verify Jest setup
echo "Running simple test..."
NODE_OPTIONS="--no-warnings" npx jest --config=jest.config.js --no-cache simple.test.js
