"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 価格を日本円のフォーマットに変換する
 * @param price 価格（数値）
 * @returns フォーマットされた価格文字列（例: "¥1,000"）
 */
var formatPrice = function (price) {
    return price.toLocaleString('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        currencyDisplay: 'symbol',
    });
};
exports.default = formatPrice;
