/**
 * DevMenu モック
 * CI環境用に最適化
 */

const DevMenuMock = {
  show: jest.fn(),
  hide: jest.fn(),
  reload: jest.fn(),
  addItem: jest.fn(),
  openURL: jest.fn(),
};

module.exports = DevMenuMock;
