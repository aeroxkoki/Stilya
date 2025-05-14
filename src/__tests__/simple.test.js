/**
 * Very basic test suite to verify Jest environment works correctly
 */

describe('Basic test suite', () => {
  it('should pass this simple test', () => {
    expect(true).toBe(true);
  });

  it('can add two numbers', () => {
    expect(1 + 1).toBe(2);
  });
});
