/**
 * 価格を日本円のフォーマットに変換する
 * @param price 価格（数値）
 * @returns フォーマットされた価格文字列（例: "¥1,000"）
 */
const formatPrice = (price: number): string => {
  return price.toLocaleString('ja-JP', { 
    style: 'currency', 
    currency: 'JPY',
    currencyDisplay: 'symbol',
  });
};

export default formatPrice;
