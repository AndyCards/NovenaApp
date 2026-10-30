// Makes a small thumbnail and a full-size copy of each saint picture, cropped from the top centre.
import { mkdirSync, readdirSync } from 'node:fs';
import sharp from 'sharp';

const src = 'pipeline/source-images';
mkdirSync('out/thumbs', { recursive: true });
mkdirSync('out/images', { recursive: true });
for (const f of readdirSync(src).filter((x) => /\.(jpe?g|png)$/i.test(x))) {
  const id = f.replace(/\.[^.]+$/, '');
  await sharp(`${src}/${f}`).resize(480, 600, { fit: 'cover', position: 'top' }).jpeg({ quality: 78 }).toFile(`out/thumbs/${id}.jpg`);
  await sharp(`${src}/${f}`).resize(1200, 1500, { fit: 'cover', position: 'top' }).jpeg({ quality: 82 }).toFile(`out/images/${id}.jpg`);
  console.log('done', id);
}
