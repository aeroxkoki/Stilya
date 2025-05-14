// Mock of NativeAnimatedHelper
module.exports = {
  default: {
    setWaitingForIdentifier: jest.fn(),
    unsetWaitingForIdentifier: jest.fn(),
    disableQueue: jest.fn(),
    API: {
      createAnimatedComponent: jest.fn(),
    },
  },
};
