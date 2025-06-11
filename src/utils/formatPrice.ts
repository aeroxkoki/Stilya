/**
 * 価格を日本円のフォーマットに変換する
 * @param price 価格（数値）
 * @returns フォーマットされた価格文字列（例: "¥1,000"）
 */
const formatPrice = (price: number): string => {
  // 価格が不正な値の場合のチェック（0は許可）
  if (price < 0 || isNaN(price)) {
    console.warn('[formatPrice] Invalid price value:', price);
    return '価格情報なし';
  }
  
  try {
    return price.toLocaleString('ja-JP', { 
      style: 'currency', 
      currency: 'JPY',
      currencyDisplay: 'symbol',
    });
  } catch (error) {
    console.error('[formatPrice] Error formatting price:', error);
    return `¥${price}`;
  }
};

export default formatPrice;
