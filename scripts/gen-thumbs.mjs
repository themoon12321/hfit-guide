// 生成 dorm 缩略图（80x80，几 KB/张）——上传到 COS img/thumbs/
// 用法：node scripts/gen-thumbs.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'img/raw';
const OUT = 'img/thumbs';

fs.mkdirSync(OUT, { recursive: true });
let count = 0;
for (const f of fs.readdirSync(SRC)) {
  if (!/\.(jpe?g|png)$/i.test(f)) continue;
  const name = f.replace(/\.(jpe?g|png)$/i, '');
  await sharp(path.join(SRC, f))
    .resize(80, 80, { fit: 'cover' })
    .jpeg({ quality: 70 })
    .toFile(path.join(OUT, name + '.jpg'));
  const size = (fs.statSync(path.join(OUT, name + '.jpg')).size / 1024).toFixed(1);
  count++;
  console.log(`✓ ${name}.jpg (${size}KB)`);
}
console.log(`---- 完成：${count} 张缩略图，输出到 img/thumbs/`);
