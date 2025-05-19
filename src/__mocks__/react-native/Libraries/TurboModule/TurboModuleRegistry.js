/**
 * TurboModule Mock
 */

module.exports = {
  get: jest.fn(() => null),
  getEnforcing: jest.fn(() => ({
    show: jest.fn(),
    hide: jest.fn(),
    reload: jest.fn(),
  })),
};
