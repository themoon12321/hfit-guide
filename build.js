// 构建 webout/ 部署目录 — 复制文件 + PNG 转 JPG
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const OUT  = path.join(ROOT, 'webout');

const RAW_SRC = path.join(ROOT, '图片素材-原始未标注');
const ANN_SRC = path.join(ROOT, '照片素材-已标注');
const RAW_DST = path.join(OUT, '图片素材-原始未标注');
const ANN_DST = path.join(OUT, '照片素材-已标注');

// 1. 清理 + 建目录
if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true });
fs.mkdirSync(RAW_DST, { recursive: true });
fs.mkdirSync(ANN_DST, { recursive: true });

// 2. 复制 index.html
fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(OUT, 'index.html'));
console.log('✓ index.html');

// 3. 复制原始图片
fs.readdirSync(RAW_SRC).filter(f => f.endsWith('.jpg')).forEach(f => {
  fs.copyFileSync(path.join(RAW_SRC, f), path.join(RAW_DST, f));
});
console.log('✓ 原始图片');

// 4. PNG 转 JPG (用 sharp)
const pngs = fs.readdirSync(ANN_SRC).filter(f => f.endsWith('.png'));
if (pngs.length > 0) {
  console.log('正在安装 sharp（图片处理库）...');
  execSync('npm install sharp', { cwd: ROOT, stdio: 'pipe' });
  const sharp = require('sharp');

  (async () => {
    for (const f of pngs) {
      const jpgName = f.replace(/\.png$/i, '.jpg');
      try {
        await sharp(path.join(ANN_SRC, f))
          .jpeg({ quality: 93, mozjpeg: true })
          .toFile(path.join(ANN_DST, jpgName));
        console.log(`  ✓ ${f} → ${jpgName}`);
      } catch (err) {
        console.error(`  ✗ ${f}: ${err.message}`);
      }
    }
    finish();
  })();
} else {
  finish();
}

function finish() {
  const total = getSize(OUT);
  console.log(`\n完成！webout/ 总大小: ${(total / 1024 / 1024).toFixed(0)}MB`);
  console.log(`路径: ${OUT}`);
}

function getSize(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) total += getSize(fp);
    else total += fs.statSync(fp).size;
  }
  return total;
}
