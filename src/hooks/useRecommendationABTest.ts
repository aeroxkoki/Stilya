import { useAuth } from '@/hooks/useAuth';

/**
 * 推薦アルゴリズムのA/Bテスト用フック
 */
export function useRecommendationABTest() {
  const { user } = useAuth();
  const userId = user?.id;
  
  // ユーザーIDの最後の文字で振り分け
  const variant = userId ? 
    parseInt(userId.slice(-1), 16) % 2 === 0 ? 'control' : 'improved' : 
    'control';
  
  return {
    variant,
    shouldUseImprovedAlgorithm: variant === 'improved'
  };
}
