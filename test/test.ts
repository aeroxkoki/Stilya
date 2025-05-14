
// テスト用に簡略化したスクリプト
type Product = {
  id: string;
  tags: string[];
};

// 本番と同じシグネチャのテスト関数
function fetchProductsByTags(
  tags: string[],
  limit = 10,
  excludeIds: string[] = []
): Product[] {
  // シンプルな実装
  return [];
}

// 問題が起きていたコードの再現
function testFunction() {
  // userPreferenceからタグを抽出（型安全性を確保）- 修正前
  const topTags: any[] = ["casual", "modern", 123]; // 数値も混じった配列
  const validTags1: string[] = [];
  
  // 問題のあったコード
  // validTags1.push(...topTags.filter(tag => typeof tag === 'string'));
  
  // 修正後のコード
  const stringTags: string[] = topTags.filter((tag): tag is string => typeof tag === 'string');
  validTags1.push(...stringTags);
  
  // 関数呼び出し
  fetchProductsByTags(validTags1);
  
  console.log("テスト成功: 型エラーは発生しませんでした");
}

testFunction();
