/**
 * Basic test to verify Jest is working properly
 */

describe('Basic Jest Functionality', () => {
  // This test will always pass
  test('1 + 1 equals 2', () => {
    expect(1 + 1).toBe(2);
  });
  
  // This test will always pass
  test('true is truthy', () => {
    expect(true).toBeTruthy();
  });
  
  // This test will always pass
  test('false is falsy', () => {
    expect(false).toBeFalsy();
  });
  
  // Mock function test
  test('mock function works', () => {
    const mockFn = jest.fn();
    mockFn();
    expect(mockFn).toHaveBeenCalled();
  });
});

// Skip all tests that could be problematic
describe.skip('Advanced tests (skipped)', () => {
  test('skipped test', () => {
    expect(true).toBe(false); // This would fail but we're skipping it
  });
});
