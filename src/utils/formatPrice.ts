/**
 * 価格を日本円のフォーマットに変換する
 * @param price 価格（数値）
 * @returns フォーマットされた価格文字列（例: "¥1,000"）
 */
const formatPrice = (price: number | undefined | null): string => {
  // 価格が存在しない場合のエラーハンドリング
  if (price === undefined || price === null || isNaN(price)) {
    console.warn('[formatPrice] Invalid price value:', price);
    return '¥0';
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
