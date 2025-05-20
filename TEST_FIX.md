# Stilya Test Suite Fix

This document explains how we fixed the Jest testing issues in the Stilya project.

## Problem 1: UUID Redeclaration

The tests were initially failing with the following error:

```
SyntaxError: Identifier 'uuid' has already been declared
  at Runtime.createScriptFromCode (node_modules/jest-runtime/build/index.js:1505:14)
```

This error was occurring in the Jest Expo preset setup file at `node_modules/jest-expo/src/preset/setup.js:278`. The issue was that `uuid` was being redeclared.

## Problem 2: globalThis.expo Undefined

After fixing the UUID issue, a new error emerged:

```
TypeError: Cannot destructure property 'EventEmitter' of 'globalThis.expo' as it is undefined.
  at node_modules/jest-expo/src/preset/setup.js:228:13
```

This error was occurring because `globalThis.expo` needs to be initialized before it's used.

## Solution

We implemented a comprehensive solution using `patch-package` to patch the `jest-expo` module:

1. Created a custom patch for `jest-expo` that:
   - Redirects the uuid import to our mock implementation
   - Adds initialization code for `globalThis.expo` at the top of the file
   - Ensures `ExpoModulesCore` is properly defined

2. Added `patch-package` to handle applying the fix automatically

3. Enhanced the scripts to ensure patches are applied in the correct sequence, with multiple safeguards:
   - The setup scripts check for the existence of `globalThis.expo` and initialize it if needed
   - Created a special test script that ensures all components are properly initialized 

## Implementation

1. **Patched Files**: 
   - Created a patch for `jest-expo` at `/patches/jest-expo+50.0.0.patch` 
   - Fixed both the uuid redeclaration issue and the globalThis.expo initialization

2. **Test Script**: 
   - Enhanced the script `/scripts/fix-uuid-tests.sh` to perform comprehensive checking and patching
   - Improved the test workflow to add multiple layers of protection

3. **GitHub Actions**: 
   - Updated the CI workflow to apply patches before running tests
   - Added conditional logic to handle both patching methods

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

The root causes of the issues were:

1. In `jest-expo/src/preset/setup.js`, the `uuid` module was being redeclared.
2. The code was trying to destructure properties from `globalThis.expo` before it was properly initialized.

Our patch fixes these issues by:

1. Using our custom UUID mock instead of requiring the original one:
```javascript
// Before
const uuid = jest.requireActual('expo-modules-core/src/uuid/uuid.web');
// After
const customUuid = jest.requireActual('../../../src/__mocks__/uuid');
```

2. Adding initialization for `globalThis.expo` at the start of the file:
```javascript
// Ensure globalThis.expo exists with proper interfaces
if (!globalThis.expo) {
  globalThis.expo = {
    EventEmitter: class { /* implementation */ },
    NativeModule: class { /* implementation */ },
    SharedObject: class { /* implementation */ }
  };
}
```

This ensures all necessary objects are properly initialized before they're used, preventing the destructuring errors.
