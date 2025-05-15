/**
 * Basic test to verify Jest is working properly
 */

describe('Basic Jest Functionality', () => {
  test('1 + 1 equals 2', () => {
    expect(1 + 1).toBe(2);
  });
  
  test('true is truthy', () => {
    expect(true).toBeTruthy();
  });
  
  test('false is falsy', () => {
    expect(false).toBeFalsy();
  });
});
