/**
 * 画像URL検証ユーティリティ
 * 画像表示問題の根本的解決のための診断機能
 */

/**
 * 画像URLがHTTPSを使用しているか確認
 */
export const isSecureUrl = (url: string): boolean => {
  if (!url) return false;
  return url.startsWith('https://');
};

/**
 * 画像URLが有効な形式か確認
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  // 基本的なURL検証
  try {
    const urlObj = new URL(url);
    // HTTPSのみ許可
    if (urlObj.protocol !== 'https:') {
      console.warn('[ImageValidation] Non-HTTPS URL detected:', url);
      return false;
    }
    
    // 画像拡張子の確認（オプション）
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
    const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));
    
    // 楽天の画像URLパターンを確認
    const isRakutenImage = url.includes('image.rakuten.co.jp') || url.includes('thumbnail.image.rakuten.co.jp');
    
    // 楽天の画像URLは拡張子がなくても有効
    if (isRakutenImage) {
      return true;
    }
    
    // その他のURLは画像拡張子が必要
    return hasImageExtension;
  } catch (error) {
    console.error('[ImageValidation] Invalid URL format:', url, error);
    return false;
  }
};

/**
 * 画像URLの診断情報を取得
 */
export const diagnoseImageUrl = (url: string): {
  isValid: boolean;
  isSecure: boolean;
  domain: string;
  issues: string[];
  suggestions: string[];
} => {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  if (!url) {
    issues.push('画像URLが空です');
    suggestions.push('商品データに画像URLが含まれているか確認してください');
    return {
      isValid: false,
      isSecure: false,
      domain: '',
      issues,
      suggestions
    };
  }
  
  const isSecure = isSecureUrl(url);
  if (!isSecure) {
    issues.push('HTTPSではないURLです');
    suggestions.push('HTTPSのURLに変更してください');
  }
  
  let domain = '';
  try {
    const urlObj = new URL(url);
    domain = urlObj.hostname;
    
    // 楽天のサムネイルドメインをチェック
    if (domain === 'thumbnail.image.rakuten.co.jp') {
      issues.push('サムネイル画像URLが使用されています');
      suggestions.push('高画質版のURLに変換する必要があります');
    }
    
    // 画像URLのパスをチェック
    if (url.includes('128x128') || url.includes('64x64')) {
      issues.push('低解像度の画像URLが使用されています');
      suggestions.push('サイズ指定を削除して高画質版を取得してください');
    }
    
    // クエリパラメータをチェック
    if (url.includes('_ex=128x128') || url.includes('_ex=64x64')) {
      issues.push('クエリパラメータで低解像度が指定されています');
      suggestions.push('_exパラメータを削除してください');
    }
  } catch (error) {
    issues.push('無効なURL形式です');
    suggestions.push('正しいURL形式を使用してください');
  }
  
  const isValid = isSecure && issues.length === 0;
  
  return {
    isValid,
    isSecure,
    domain,
    issues,
    suggestions
  };
};

/**
 * 楽天の画像URLを修正（シンプル版）
 * 実機での画像表示を優先して、最小限の変換のみ行う
 */
export const fixRakutenImageUrl = (url: string): string => {
  if (!url) return '';
  
  let fixedUrl = url;
  
  // HTTPをHTTPSに変換（必須）
  if (fixedUrl.startsWith('http://')) {
    fixedUrl = fixedUrl.replace('http://', 'https://');
  }
  
  // 実機での画像表示問題を解決するため、以下の変換は行わない：
  // - サムネイルドメインの変更
  // - サイズ指定の削除
  // これらの変換が実機での画像表示問題の原因である可能性があるため
  
  return fixedUrl;
};

/**
 * バッチで複数の画像URLを診断
 */
export const batchDiagnoseImageUrls = (urls: string[]): {
  validCount: number;
  invalidCount: number;
  httpCount: number;
  thumbnailCount: number;
  lowResCount: number;
  details: Array<{
    url: string;
    diagnosis: ReturnType<typeof diagnoseImageUrl>;
  }>;
} => {
  let validCount = 0;
  let invalidCount = 0;
  let httpCount = 0;
  let thumbnailCount = 0;
  let lowResCount = 0;
  
  const details = urls.map(url => {
    const diagnosis = diagnoseImageUrl(url);
    
    if (diagnosis.isValid) {
      validCount++;
    } else {
      invalidCount++;
    }
    
    if (!diagnosis.isSecure) {
      httpCount++;
    }
    
    if (diagnosis.domain === 'thumbnail.image.rakuten.co.jp') {
      thumbnailCount++;
    }
    
    if (diagnosis.issues.some(issue => issue.includes('低解像度'))) {
      lowResCount++;
    }
    
    return { url, diagnosis };
  });
  
  return {
    validCount,
    invalidCount,
    httpCount,
    thumbnailCount,
    lowResCount,
    details
  };
};

/**
 * 画像URLの問題を自動修正（根本的修正版）
 */
export const autoFixImageUrl = (url: string): {
  original: string;
  fixed: string;
  wasFixed: boolean;
  changes: string[];
} => {
  const original = url;
  const changes: string[] = [];
  let fixed = url;
  
  if (!url) {
    return { original, fixed, wasFixed: false, changes: ['URLが空です'] };
  }
  
  // HTTPをHTTPSに変換（必須）
  if (fixed.startsWith('http://')) {
    fixed = fixed.replace('http://', 'https://');
    changes.push('HTTPをHTTPSに変換');
  }
  
  // 楽天のサムネイルドメインを高画質版に変換
  if (fixed.includes('thumbnail.image.rakuten.co.jp')) {
    fixed = fixed.replace('thumbnail.image.rakuten.co.jp', 'image.rakuten.co.jp');
    changes.push('サムネイルドメインを高画質版に変換');
  }
  
  // URLのサイズ指定を削除（128x128, 64x64など）
  if (fixed.includes('/128x128/') || fixed.includes('/64x64/')) {
    fixed = fixed.replace(/\/128x128\//, '/');
    fixed = fixed.replace(/\/64x64\//, '/');
    changes.push('低解像度サイズ指定を削除');
  }
  
  // クエリパラメータのサイズ指定を削除
  if (fixed.includes('_ex=128x128') || fixed.includes('_ex=64x64')) {
    fixed = fixed.replace(/_ex=128x128/g, '');
    fixed = fixed.replace(/_ex=64x64/g, '');
    fixed = fixed.replace(/\?$/, ''); // 末尾の?を削除
    changes.push('クエリパラメータのサイズ指定を削除');
  }
  
  // 楽天の画像URLパターンに基づいた追加の修正
  // cabinet/128x128/ -> cabinet/
  if (fixed.includes('/cabinet/128x128/') || fixed.includes('/cabinet/64x64/')) {
    fixed = fixed.replace('/cabinet/128x128/', '/cabinet/');
    fixed = fixed.replace('/cabinet/64x64/', '/cabinet/');
    changes.push('cabinetパスのサイズ指定を削除');
  }
  
  const wasFixed = original !== fixed;
  
  return {
    original,
    fixed,
    wasFixed,
    changes
  };
};
