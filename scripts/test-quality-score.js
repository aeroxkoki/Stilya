// 品質スコア計算関数のテスト
const calculateProductQualityScore = (data) => {
  const { reviewCount, reviewAverage } = data;
  
  if (reviewCount === 0) {
    return { total: 30, confidence: 'low' }; // ベースラインスコア
  }
  
  // Wilson Score計算（簡略版）
  const z = 1.96; // 95%信頼区間
  const n = reviewCount;
  const p = reviewAverage / 5;
  
  const score = (p + z*z/(2*n) - z * Math.sqrt(p*(1-p)/n + z*z/(4*n*n))) / (1 + z*z/n);
  
  return {
    total: Math.round(score * 100),
    confidence: reviewCount > 50 ? 'high' : reviewCount > 10 ? 'medium' : 'low'
  };
};

// テストケース
console.log('品質スコア計算テスト:');
console.log('=====================================');
console.log('100 reviews, 4.5 avg:', calculateProductQualityScore({ reviewCount: 100, reviewAverage: 4.5 }));
console.log('50 reviews, 4.0 avg:', calculateProductQualityScore({ reviewCount: 50, reviewAverage: 4.0 }));
console.log('10 reviews, 5.0 avg:', calculateProductQualityScore({ reviewCount: 10, reviewAverage: 5.0 }));
console.log('5 reviews, 3.5 avg:', calculateProductQualityScore({ reviewCount: 5, reviewAverage: 3.5 }));
console.log('0 reviews:', calculateProductQualityScore({ reviewCount: 0, reviewAverage: 0 }));
console.log('=====================================');

// レビュー数と評価の関係を表示
console.log('\nレビュー数による信頼度の変化:');
console.log('=====================================');
const avgRating = 4.0;
[1, 5, 10, 25, 50, 100, 500].forEach(count => {
  const result = calculateProductQualityScore({ reviewCount: count, reviewAverage: avgRating });
  console.log(`${count}件のレビュー (平均${avgRating}): スコア${result.total}, 信頼度${result.confidence}`);
});
