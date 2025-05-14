// src/__tests__/utils/deviceTestUtils.ts
// モックファイル
jest.mock('expo-device', () => ({
  isDevice: true,
  brand: 'mock-brand',
  manufacturer: 'mock-manufacturer',
  modelName: 'mock-model',
  deviceName: 'mock-device',
  deviceYearClass: 2023,
  totalMemory: 4096,
  supportedCpuArchitectures: ['arm64'],
  osName: 'Android',
  osVersion: '12',
  osBuildId: 'mock-build',
  osInternalBuildId: 'mock-internal-build',
  osBuildFingerprint: 'mock-fingerprint',
  platformApiLevel: 31,
  deviceType: 1, // PHONE
}));

export const setupDevice = () => {
  // デバイス関連の追加セットアップがあればここに実装
};

// mockDeviceShape function to simulate different device dimensions
export const mockDeviceShape = (deviceType: string | any) => {
  // 実装詳細
  return deviceType;
};

// resetDeviceMock function to restore original dimensions
export const resetDeviceMock = () => {
  // 実装詳細
};

// mockLandscapeOrientation function to simulate landscape orientation
export const mockLandscapeOrientation = (deviceType: string) => {
  // 実装詳細
  return deviceType;
};

// Basic test case
describe('Device Test Utils', () => {
  it('should have device mocking functions', () => {
    expect(typeof mockDeviceShape).toBe('function');
    expect(typeof resetDeviceMock).toBe('function');
    expect(typeof mockLandscapeOrientation).toBe('function');
  });
});
