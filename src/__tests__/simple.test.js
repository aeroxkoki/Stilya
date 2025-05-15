/**
 * Simple test to check if Jest is working
 */

describe('Basic test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    expect('Stilya' + ' App').toBe('Stilya App');
  });

  it('should handle object equality', () => {
    const user = { id: 1, name: 'Test User' };
    expect(user).toEqual({ id: 1, name: 'Test User' });
  });
});

describe('Array operations', () => {
  it('should add items to array', () => {
    const arr = [];
    arr.push('item');
    expect(arr).toHaveLength(1);
    expect(arr[0]).toBe('item');
  });
});