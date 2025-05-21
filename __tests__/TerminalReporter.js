/**
 * Custom Terminal Reporter for Jest Tests
 * Used in GitHub Actions CI pipeline
 */
class TerminalReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options || {};
  }

  onRunComplete(contexts, results) {
    // Test run completed
    console.log('\nSummary of Test Results:');
    console.log(`Total Tests: ${results.numTotalTests}`);
    console.log(`Tests Passed: ${results.numPassedTests}`);
    console.log(`Tests Failed: ${results.numFailedTests}`);
    
    if (results.numFailedTests > 0) {
      console.log('\nFailed Tests:');
      results.testResults.forEach(testResult => {
        if (testResult.failureMessage) {
          console.log(`- ${testResult.testFilePath}`);
        }
      });
    }
  }

  onRunStart() {
    console.log('Starting test suite...');
  }

  onTestResult(test, testResult) {
    if (testResult.failureMessage) {
      console.log(`\nTest failed: ${testResult.testFilePath}`);
    }
  }
}

module.exports = TerminalReporter;
