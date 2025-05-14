/**
 * DevMenu Mock
 */

const DevMenu = {
  show: jest.fn(),
  reload: jest.fn(),
  debugRemotely: jest.fn(),
  addItem: jest.fn(),
  addItems: jest.fn(),
  items: [],
};

export default DevMenu;
