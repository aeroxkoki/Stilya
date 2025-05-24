// Zustandのモック
jest.mock('zustand', () => ({
  create: (fn: any) => {
    const store = fn(mockSetState);
    return Object.assign(
      () => mockGetState(),
      {
        getState: mockGetState,