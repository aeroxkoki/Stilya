import { Platform } from 'react-native';
import { SUPABASE_URL } from '../utils/env';

interface DiagnosticResult {
  test: string;
  success: boolean;
  error?: string;
  details?: any;
}

export const runNetworkDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];
  
  // Test 1: Basic fetch to known API
  try {
    const response = await fetch('https://api.github.com/');
    results.push({
      test: 'GitHub API (HTTPS)',
      success: response.ok,
      details: { status: response.status }
    });
  } catch (error: any) {
    results.push({
      test: 'GitHub API (HTTPS)',
      success: false,
      error: error.message,
      details: { errorType: error.constructor.name }
    });
  }
  
  // Test 2: Supabase URL availability
  try {
    const response = await fetch(SUPABASE_URL);
    results.push({
      test: 'Supabase URL',
      success: response.ok,
      details: { 
        status: response.status,
        url: SUPABASE_URL
      }
    });
  } catch (error: any) {
    results.push({
      test: 'Supabase URL',
      success: false,
      error: error.message,
      details: { 
        url: SUPABASE_URL,
        errorType: error.constructor.name 
      }
    });
  }
  
  // Test 3: Platform info
  results.push({
    test: 'Platform Info',
    success: true,
    details: {
      OS: Platform.OS,
      Version: Platform.Version,
      isTV: Platform.isTV,
    }
  });
  
  // Test 4: Supabase Auth endpoint
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    results.push({
      test: 'Supabase Auth Endpoint',
      success: response.ok || response.status === 404, // 404 is expected for GET on auth endpoint
      details: { 
        status: response.status,
        statusText: response.statusText 
      }
    });
  } catch (error: any) {
    results.push({
      test: 'Supabase Auth Endpoint',
      success: false,
      error: error.message,
      details: { errorType: error.constructor.name }
    });
  }
  
  return results;
};

export const logDiagnosticResults = (results: DiagnosticResult[]) => {
  console.log('=== Network Diagnostics Results ===');
  results.forEach(result => {
    console.log(`[${result.success ? '✓' : '✗'}] ${result.test}`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
    if (result.details) {
      console.log(`    Details:`, result.details);
    }
  });
  console.log('==================================');
};
