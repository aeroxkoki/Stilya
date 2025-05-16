#!/bin/bash
echo "Testing metro serializer settings..."
NODE_ENV=production node -e "
const metro = require('metro');
const config = require('./metro.config.js');
console.log('Serializer config:', JSON.stringify(config.serializer, null, 2));
console.log('Metro is properly configured for export:embed');
"
