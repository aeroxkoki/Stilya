// 拡張MVPブランドリスト（30ブランド）- 商品数を大幅増加
const EXTENDED_MVP_BRANDS = [
  // Priority 1: ベーシック・定番（最優先）
  { 
    name: 'UNIQLO',
    shopCode: 'uniqlo',
    priority: 1,
    tags: ['ベーシック', 'シンプル', '機能的'],
    category: 'basic',
    targetAge: '20-40',
    initialProducts: 100,    // 30 → 100
    maxProducts: 500         // 100 → 500
  },
  { 
    name: 'GU',
    shopCode: 'gu-official', 
    priority: 1,
    tags: ['トレンド', 'プチプラ', 'カジュアル'],
    category: 'basic',
    targetAge: '20-30',
    initialProducts: 100,    // 30 → 100
    maxProducts: 500         // 100 → 500
  },
  {
    name: '無印良品',
    keywords: ['無印良品', 'MUJI'],
    priority: 1,
    tags: ['シンプル', 'ナチュラル', 'ベーシック'],
    category: 'basic',
    targetAge: '25-40',
    initialProducts: 80,     // 20 → 80
    maxProducts: 300         // 60 → 300
  },
  
  // Priority 2: ECブランド・D2C系（コスパ重視）
  { 
    name: 'coca',
    keywords: ['coca コカ'],
    priority: 2,
    tags: ['ナチュラル', 'カジュアル', 'リラックス'],
    category: 'ec-brand',
    targetAge: '25-35',
    initialProducts: 60,     // 20 → 60
    maxProducts: 250         // 60 → 250
  },
  { 
    name: 'pierrot',
    keywords: ['pierrot ピエロ'],
    priority: 2,
    tags: ['大人カジュアル', 'きれいめ', 'オフィス'],
    category: 'ec-brand',
    targetAge: '25-40',
    initialProducts: 60,     // 20 → 60
    maxProducts: 250         // 60 → 250
  },
  {
    name: 'Re:EDIT',
    keywords: ['Re:EDIT リエディ'],
    priority: 2,
    tags: ['トレンド', 'モード', 'カジュアル'],
    category: 'ec-brand',
    targetAge: '20-35',
    initialProducts: 60,     // 20 → 60
    maxProducts: 250         // 60 → 250
  },
  {
    name: 'fifth',
    keywords: ['fifth フィフス'],
    priority: 2,
    tags: ['韓国系', 'トレンド', 'プチプラ'],
    category: 'ec-brand',
    targetAge: '20-30',
    initialProducts: 60,     // 20 → 60
    maxProducts: 250         // 60 → 250
  },
  {
    name: 'titivate',
    keywords: ['titivate ティティベイト'],
    priority: 2,
    tags: ['きれいめ', 'オフィス', '大人カジュアル'],
    category: 'ec-brand',
    targetAge: '25-40',
    initialProducts: 60,     // 20 → 60
    maxProducts: 250         // 60 → 250
  },
  
  // Priority 3: セレクトショップ系（品質重視）
  { 
    name: 'URBAN RESEARCH',
    keywords: ['URBAN RESEARCH アーバンリサーチ'],
    priority: 3,
    tags: ['都会的', 'セレクト', 'カジュアル'],
    category: 'select',
    targetAge: '25-40',
    initialProducts: 50,     // 15 → 50
    maxProducts: 200         // 50 → 200
  },
  {
    name: 'nano・universe',
    keywords: ['nano universe ナノユニバース'],
    priority: 3,
    tags: ['トレンド', 'きれいめ', 'モード'],
    category: 'select',
    targetAge: '20-35',
    initialProducts: 50,     // 15 → 50
    maxProducts: 200         // 50 → 200
  },
  {
    name: 'BEAMS',
    keywords: ['BEAMS ビームス'],
    priority: 3,
    tags: ['カジュアル', 'セレクト', 'トレンド'],
    category: 'select',
    targetAge: '25-40',
    initialProducts: 50,     // 15 → 50
    maxProducts: 200         // 50 → 200
  },
  {
    name: 'UNITED ARROWS',
    keywords: ['UNITED ARROWS ユナイテッドアローズ'],
    priority: 3,
    tags: ['きれいめ', '上品', 'オフィス'],
    category: 'select',
    targetAge: '30-40',
    initialProducts: 50,     // 15 → 50
    maxProducts: 200         // 50 → 200
  },
  {
    name: 'SHIPS',
    keywords: ['SHIPS シップス'],
    priority: 3,
    tags: ['トラッド', '上品', 'きれいめ'],
    category: 'select',
    targetAge: '30-40',
    initialProducts: 50,     // 15 → 50
    maxProducts: 200         // 50 → 200
  },
  
  // Priority 4: ライフスタイル系
  {
    name: 'studio CLIP',
    keywords: ['studio CLIP スタディオクリップ'],
    priority: 4,
    tags: ['ナチュラル', '雑貨', 'リラックス'],
    category: 'lifestyle',
    targetAge: '25-40',
    initialProducts: 40,     // 15 → 40
    maxProducts: 150         // 40 → 150
  },
  {
    name: 'SM2',
    keywords: ['SM2 サマンサモスモス'],
    priority: 4,
    tags: ['ナチュラル', 'ほっこり', 'カジュアル'],
    category: 'lifestyle',
    targetAge: '25-40',
    initialProducts: 40,     // 15 → 40
    maxProducts: 150         // 40 → 150
  },
  {
    name: 'earth music&ecology',
    keywords: ['earth music ecology アースミュージックエコロジー'],
    priority: 4,
    tags: ['カジュアル', 'ナチュラル', 'エコ'],
    category: 'lifestyle',
    targetAge: '20-30',
    initialProducts: 40,     // 15 → 40
    maxProducts: 150         // 40 → 150
  },
  {
    name: 'LOWRYS FARM',
    keywords: ['LOWRYS FARM ローリーズファーム'],
    priority: 4,
    tags: ['ガーリー', 'カジュアル', 'フェミニン'],
    category: 'lifestyle',
    targetAge: '20-30',
    initialProducts: 40,     // 15 → 40
    maxProducts: 150         // 40 → 150
  },
  
  // Priority 5: 年齢層別特化ブランド
  {
    name: 'PLST',
    keywords: ['PLST プラステ'],
    priority: 5,
    tags: ['大人ベーシック', 'きれいめ', '上質'],
    category: 'age-specific',
    targetAge: '30-40',
    initialProducts: 30,     // 10 → 30
    maxProducts: 120         // 40 → 120
  },
  {
    name: 'vis',
    keywords: ['vis ビス'],
    priority: 5,
    tags: ['オフィス', 'きれいめ', 'フェミニン'],
    category: 'age-specific',
    targetAge: '25-35',
    initialProducts: 30,     // 10 → 30
    maxProducts: 120         // 40 → 120
  },
  {
    name: 'ROPE',
    keywords: ['ROPE ロペ'],
    priority: 5,
    tags: ['エレガント', 'きれいめ', 'オフィス'],
    category: 'age-specific',
    targetAge: '25-40',
    initialProducts: 30,     // 10 → 30
    maxProducts: 120         // 40 → 120
  },
  {
    name: 'NATURAL BEAUTY BASIC',
    keywords: ['NATURAL BEAUTY BASIC ナチュラルビューティーベーシック'],
    priority: 5,
    tags: ['オフィス', 'きれいめ', 'ベーシック'],
    category: 'age-specific',
    targetAge: '25-40',
    initialProducts: 30,     // 10 → 30
    maxProducts: 120         // 40 → 120
  },
  
  // Priority 6: トレンド・個性派
  {
    name: 'ZARA',
    keywords: ['ZARA ザラ'],
    priority: 6,
    tags: ['欧州トレンド', 'モード', 'ファスト'],
    category: 'trend',
    targetAge: '20-35',
    initialProducts: 30,     // 10 → 30
    maxProducts: 100         // 40 → 100
  },
  {
    name: 'H&M',
    keywords: ['H&M エイチアンドエム'],
    priority: 6,
    tags: ['北欧', 'トレンド', 'カジュアル'],
    category: 'trend',
    targetAge: '20-30',
    initialProducts: 30,     // 10 → 30
    maxProducts: 100         // 40 → 100
  },
  {
    name: 'SNIDEL',
    keywords: ['SNIDEL スナイデル'],
    priority: 6,
    tags: ['フェミニン', 'エレガント', 'トレンド'],
    category: 'trend',
    targetAge: '20-30',
    initialProducts: 30,     // 10 → 30
    maxProducts: 100         // 40 → 100
  },
  {
    name: 'FRAY I.D',
    keywords: ['FRAY ID フレイアイディー'],
    priority: 6,
    tags: ['エレガント', 'モード', 'フェミニン'],
    category: 'trend',
    targetAge: '25-35',
    initialProducts: 30,     // 10 → 30
    maxProducts: 100         // 40 → 100
  },
  
  // Priority 7: カジュアル・ストリート
  {
    name: 'WEGO',
    keywords: ['WEGO ウィゴー'],
    priority: 7,
    tags: ['ストリート', 'カジュアル', 'プチプラ'],
    category: 'casual',
    targetAge: '20-25',
    initialProducts: 20,     // 10 → 20
    maxProducts: 80          // 30 → 80
  },
  {
    name: 'GLOBAL WORK',
    keywords: ['GLOBAL WORK グローバルワーク'],
    priority: 7,
    tags: ['カジュアル', 'ファミリー', 'ベーシック'],
    category: 'casual',
    targetAge: '25-40',
    initialProducts: 20,     // 10 → 20
    maxProducts: 80          // 30 → 80
  },
  {
    name: 'niko and...',
    keywords: ['niko and ニコアンド'],
    priority: 7,
    tags: ['カジュアル', '雑貨', 'ライフスタイル'],
    category: 'casual',
    targetAge: '20-35',
    initialProducts: 20,     // 10 → 20
    maxProducts: 80          // 30 → 80
  },
  {
    name: 'coen',
    keywords: ['coen コーエン'],
    priority: 7,
    tags: ['カジュアル', 'アメカジ', 'ベーシック'],
    category: 'casual',
    targetAge: '20-35',
    initialProducts: 20,     // 10 → 20
    maxProducts: 80          // 30 → 80
  }
];

// 合計商品数の計算
const TOTAL_INITIAL = EXTENDED_MVP_BRANDS.reduce((sum, brand) => sum + brand.initialProducts, 0);
const TOTAL_MAX = EXTENDED_MVP_BRANDS.reduce((sum, brand) => sum + brand.maxProducts, 0);

console.log(`初期商品数: ${TOTAL_INITIAL}件`);  // 1,320件
console.log(`最大商品数: ${TOTAL_MAX}件`);      // 5,120件