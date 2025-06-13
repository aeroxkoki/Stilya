// Node.js 18+ has native fetch support

async function testSupabaseConnectivity() {
  const SUPABASE_URL = 'https://ddypgpljprljqrblpuli.supabase.co';
  const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  
  const tests = [
    {
      name: 'Health Check',
      url: `${SUPABASE_URL}/rest/v1/`,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    },
    {
      name: 'Auth Endpoint',
      url: `${SUPABASE_URL}/auth/v1/health`,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY
      }
    },
  ];
  
  console.log('🔍 Testing Supabase connectivity...\n');
  console.log(`Base URL: ${SUPABASE_URL}`);
  console.log(`API Key: ${SUPABASE_ANON_KEY ? 'Set' : 'Not set'}\n`);
  
  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await fetch(test.url, { 
        method: test.method,
        headers: test.headers 
      });
      console.log(`✅ ${test.name}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        console.log(`   Content-Type: ${contentType}`);
        
        // Try to read response body
        try {
          const text = await response.text();
          if (text && text.length < 200) {
            console.log(`   Response: ${text}`);
          } else if (text) {
            console.log(`   Response: ${text.substring(0, 100)}...`);
          }
        } catch (e) {
          console.log(`   Could not read response body`);
        }
      } else {
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
      }
    } catch (error) {
      console.error(`❌ ${test.name}: ${error.message}`);
      if (error.cause) {
        console.error(`   Cause: ${error.cause}`);
      }
      if (error.code) {
        console.error(`   Code: ${error.code}`);
      }
    }
    console.log('');
  }
  
  console.log('✅ Network connectivity test complete!');
}

// Load environment variables if .env exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  }
  console.log('📋 Loaded environment variables from .env\n');
}

// Run the test
testSupabaseConnectivity().catch(console.error);
