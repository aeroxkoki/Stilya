/**
 * Basic tests to verify Jest setup is working
 */

import { mockProducts } from './utils/testUtils';

describe('Basic Tests', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should access mock data', () => {
    expect(mockProducts).toBeDefined();
    expect(mockProducts.length).toBe(2);
    expect(mockProducts[0].name).toBe('ベーシックTシャツ');
  });

  it('should handle async tests', async () => {
    const asyncFunction = () => Promise.resolve('success');
    await expect(asyncFunction()).resolves.toBe('success');
  });
});
