import { act, renderHook } from '@testing-library/react-hooks';
import { useAuthStore } from '@/store/authStore';
import * as supabaseService from '@/services/supabase';

// Supabaseサービスのモック
jest.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      getUser: jest.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
    },
  },
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
  updatePassword: jest.fn(),
  refreshSession: jest.fn(),
  isSessionExpired: jest.fn(),
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  createUserProfile: jest.fn(),
}));

describe('AuthStore', () => {
  beforeEach(() => {
    // モックをリセット
    jest.clearAllMocks();

    // テスト実行前に状態をリセット
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.setUser(null);
      result.current.clearError();
    });
  });

  describe('initialize', () => {
    it('セッションがない場合、ユーザーはnullになる', async () => {
      // Supabaseのモック設定
      (supabaseService.supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const { result, waitForNextUpdate } = renderHook(() => useAuthStore());

      act(() => {
        result.current.initialize();
      });

      await waitForNextUpdate();

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('セッションとユーザーがある場合、ユーザー情報が設定される', async () => {
      // Supabaseのモック設定
      const mockSession = { id: 'test-session' };
      const mockUser = { id: 'test-user', email: 'test@example.com' };
      const mockProfile = { gender: 'male', ageGroup: '20s' };

      (supabaseService.supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      (supabaseService.supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      (supabaseService.getUserProfile as jest.Mock).mockResolvedValueOnce(mockProfile);
      (supabaseService.isSessionExpired as jest.Mock).mockReturnValueOnce(false);

      const { result, waitForNextUpdate } = renderHook(() => useAuthStore());

      act(() => {
        result.current.initialize();
      });

      await waitForNextUpdate();

      expect(result.current.user).toEqual({
        ...mockUser,
        ...mockProfile,
      });
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('初期化中にエラーが発生した場合、エラー状態が設定される', async () => {
      // Supabaseのモック設定
      (supabaseService.supabase.auth.getSession as jest.Mock).mockRejectedValueOnce(
        new Error('テストエラー')
      );

      const { result, waitForNextUpdate } = renderHook(() => useAuthStore());

      act(() => {
        result.current.initialize();
      });

      await waitForNextUpdate();

      expect(result.current.error).toBe('セッションの初期化に失敗しました');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('login', () => {
    it('ログイン成功時にユーザー情報とセッションが設定される', async () => {
      // モックデータ
      const mockEmail = 'test@example.com';
      const mockPassword = 'password';
      const mockUser = { id: 'test-user', email: mockEmail };
      const mockSession = { id: 'test-session' };
      const mockProfile = { gender: 'male' };

      // Supabaseのモック設定
      (supabaseService.signIn as jest.Mock).mockResolvedValueOnce({
        user: mockUser,
        session: mockSession,
      });

      (supabaseService.getUserProfile as jest.Mock).mockResolvedValueOnce(mockProfile);

      const { result, waitForNextUpdate } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login(mockEmail, mockPassword);
      });

      await waitForNextUpdate();

      expect(supabaseService.signIn).toHaveBeenCalledWith(mockEmail, mockPassword);
      expect(result.current.user).toEqual({
        ...mockUser,
        ...mockProfile,
      });
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('ログイン失敗時にエラーが設定される', async () => {
      // モックデータ
      const mockEmail = 'test@example.com';
      const mockPassword = 'password';
      const mockError = new Error('Invalid login credentials');

      // Supabaseのモック設定
      (supabaseService.signIn as jest.Mock).mockRejectedValueOnce(mockError);

      const { result, waitForNextUpdate } = renderHook(() => useAuthStore());

      act(() => {
        result.current.login(mockEmail, mockPassword);
      });

      await waitForNextUpdate();

      expect(supabaseService.signIn).toHaveBeenCalledWith(mockEmail, mockPassword);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('メールアドレスかパスワードが間違っています');
    });
  });

  describe('register', () => {
    it('登録成功時にユーザー情報とセッションが設定される', async () => {
      // モックデータ
      const mockEmail = 'test@example.com';
      const mockPassword = 'password123';
      const mockUser = { id: 'test-user', email: mockEmail };
      const mockSession = { id: 'test-session' };

      // Supabaseのモック設定
      (supabaseService.signUp as jest.Mock).mockResolvedValueOnce({
        user: mockUser,
        session: mockSession,
      });

      (supabaseService.createUserProfile as jest.Mock).mockResolvedValueOnce({ success: true });

      const { result, waitForNextUpdate } = renderHook(() => useAuthStore());

      act(() => {
        result.current.register(mockEmail, mockPassword);
      });

      await waitForNextUpdate();

      expect(supabaseService.signUp).toHaveBeenCalledWith(mockEmail, mockPassword);
      expect(supabaseService.createUserProfile).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
      });
      expect(result.current.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
      });
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('既存ユーザーで登録失敗時に適切なエラーが設定される', async () => {
      // モックデータ
      const mockEmail = 'test@example.com';
      const mockPassword = 'password123';
      const mockError = new Error('User already registered');

      // Supabaseのモック設定
      (supabaseService.signUp as jest.Mock).mockRejectedValueOnce(mockError);

      const { result, waitForNextUpdate } = renderHook(() => useAuthStore());

      act(() => {
        result.current.register(mockEmail, mockPassword);
      });

      await waitForNextUpdate();

      expect(supabaseService.signUp).toHaveBeenCalledWith(mockEmail, mockPassword);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('このメールアドレスは既に登録されています');
    });
  });

  describe('logout', () => {
    it('ログアウト成功時にユーザー情報とセッションがクリアされる', async () => {
      // 初期状態を設定
      const { result } = renderHook(() => useAuthStore());
      act(() => {
        result.current.setUser({ id: 'test-user', email: 'test@example.com' });
      });

      // Supabaseのモック設定
      (supabaseService.signOut as jest.Mock).mockResolvedValueOnce(undefined);

      act(() => {
        result.current.logout();
      });

      // テスト実行
      expect(supabaseService.signOut).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('resetUserPassword', () => {
    it('パスワードリセット成功時にローディング状態が解除される', async () => {
      // モックデータ
      const mockEmail = 'test@example.com';

      // Supabaseのモック設定
      (supabaseService.resetPassword as jest.Mock).mockResolvedValueOnce({
        data: {},
        success: true,
      });

      const { result, waitForNextUpdate } = renderHook(() => useAuthStore());

      act(() => {
        result.current.resetUserPassword(mockEmail);
      });

      await waitForNextUpdate();

      expect(supabaseService.resetPassword).toHaveBeenCalledWith(mockEmail);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('パスワードリセット失敗時にエラーが設定される', async () => {
      // モックデータ
      const mockEmail = 'test@example.com';
      const mockError = new Error('Invalid email');

      // Supabaseのモック設定
      (supabaseService.resetPassword as jest.Mock).mockRejectedValueOnce(mockError);

      const { result, waitForNextUpdate } = renderHook(() => useAuthStore());

      act(() => {
        result.current.resetUserPassword(mockEmail);
      });

      await waitForNextUpdate();

      expect(supabaseService.resetPassword).toHaveBeenCalledWith(mockEmail);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Invalid email');
    });
  });
});
