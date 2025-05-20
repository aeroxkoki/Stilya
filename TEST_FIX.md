# Stilya Test Suite Fix

This document explains how we fixed the Jest testing issues in the Stilya project.

## Problem

The tests were failing with the following error:

```
SyntaxError: Identifier 'uuid' has already been declared
  at Runtime.createScriptFromCode (node_modules/jest-runtime/build/index.js:1505:14)
```

This error was occurring in the Jest Expo preset setup file at `node_modules/jest-expo/src/preset/setup.js:278`. The issue was that `uuid` was being redeclared.

## Solution

We implemented a solution using `patch-package` to patch the `jest-expo` module:

1. Created a custom patch for `jest-expo` that redirects the uuid import to our mock implementation
2. Added `patch-package` to handle applying the fix automatically
3. Updated the test scripts to clean caches and apply patches

## Implementation

1. **Patched Files**: 
   - Created a patch for `jest-expo` at `/patches/jest-expo+50.0.0.patch` 
   - Fixed the uuid redeclaration issue by using our custom mock implementation

2. **Test Script**: 
   - Added a new test script `test:fix-uuid` to apply the patch and run tests
   - Created the shell script `/scripts/fix-uuid-tests.sh` to execute the patch and tests

3. **GitHub Actions**: 
   - Updated the CI workflow to apply patches before running tests

## How to Use

### Running Tests Locally

To run tests with the fix applied:

```bash
npm run test:fix-uuid
```

### Automatic Application

The fix is automatically applied when you install dependencies:

```bash
npm install
```

This is handled by the `postinstall` script which runs `patch-package`.

## Further Improvements

- We should consider contributing a proper fix upstream to the `jest-expo` repository
- For more complex projects, we may want to create a more comprehensive test environment setup
- We should monitor future versions of Jest and Expo for changes that might affect this fix

## Technical Details

The root cause of the issue was in the `jest-expo/src/preset/setup.js` file:

```javascript
// Problem: This line was redeclaring uuid
const uuid = jest.requireActual('expo-modules-core/src/uuid/uuid.web');
```

Our patch fixes this by using our custom uuid mock:

```javascript
// Use our custom UUID mock instead of requiring it again
const customUuid = jest.requireActual('../../../src/__mocks__/uuid');
```

This ensures we don't get a redeclaration error while still providing the necessary functionality for the tests.
