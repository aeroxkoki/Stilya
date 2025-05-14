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
