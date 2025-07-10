const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// スタイルごとの色設定
const styles = {
  'minimal-style': {
    background: '#F5F5F5',
    primary: '#1A1A1A',
    text: 'Minimal'
  },
  'natural-style': {
    background: '#FFF9F5',
    primary: '#8B6B47',
    text: 'Natural'
  },
  'bold-style': {
    background: '#FFE5E5',
    primary: '#FF6B6B',
    text: 'Bold'
  }
};

// キャンバスサイズ
const width = 400;
const height = 300;

// 画像生成関数
function generatePlaceholderImage(styleName, config) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景を塗りつぶす
  ctx.fillStyle = config.background;
  ctx.fillRect(0, 0, width, height);

  // 中央に円を描画
  ctx.fillStyle = config.primary;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2 - 20, 60, 0, Math.PI * 2);
  ctx.fill();

  // テキストを描画
  ctx.fillStyle = config.primary;
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(config.text, width / 2, height / 2 + 80);

  // ボーダーを追加
  ctx.strokeStyle = config.primary;
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  return canvas.toBuffer('image/png');
}

// 画像を生成して保存
function generateImages() {
  const outputDir = path.join(__dirname, '../assets/images/samples');
  
  // ディレクトリが存在しない場合は作成
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 各スタイルの画像を生成
  Object.entries(styles).forEach(([styleName, config]) => {
    const buffer = generatePlaceholderImage(styleName, config);
    const filePath = path.join(outputDir, `${styleName}.png`);
    fs.writeFileSync(filePath, buffer);
    console.log(`Generated: ${filePath}`);
  });

  console.log('All placeholder images generated successfully!');
}

// 実行
generateImages();
