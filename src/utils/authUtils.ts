/**
 * 認証関連のユーティリティ関数
 */

import { User } from '@/types';

/**
 * 安全にユーザーIDを取得する
 * @param user Userオブジェクト
 * @returns 有効なuserIdまたはnull
 */
export function getSafeUserId(user: User | null | undefined): string | null {
  if (!user || !user.id) {
    return null;
  }
  
  // 文字列の'undefined'や'null'を検出してログに記録
  if (user.id === 'undefined' || user.id === 'null') {
    console.error('[getSafeUserId] Invalid userId detected:', {
      userId: user.id,
      userObject: user,
      stack: new Error().stack
    });
    return null;
  }
  
  return user.id;
}

/**
 * userIdが有効かどうかを検証する
 * @param userId 検証するuserId
 * @returns userIdが有効な場合true
 */
export function isValidUserId(userId: string | null | undefined): userId is string {
  if (!userId) return false;
  if (userId === 'undefined' || userId === 'null') return false;
  
  // UUID形式の検証（オプション）
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    console.warn('[isValidUserId] Invalid UUID format:', userId);
    // 開発環境では警告のみ、本番環境では無効として扱う
    return __DEV__ ? true : false;
  }
  
  return true;
}

/**
 * デバッグ用：userIdの問題を診断する
 * @param context 呼び出し元のコンテキスト
 * @param userId 診断するuserId
 * @param user Userオブジェクト（オプション）
 */
export function diagnoseUserId(
  context: string, 
  userId: string | null | undefined,
  user?: User | null
): void {
  if (!__DEV__) return;
  
  console.log(`[diagnoseUserId] ${context}:`, {
    userId,
    userIdType: typeof userId,
    userIdValue: userId,
    isValidUserId: isValidUserId(userId),
    userObject: user,
    userIdFromUser: user?.id,
    stack: new Error().stack?.split('\n').slice(2, 5).join('\n')
  });
}
