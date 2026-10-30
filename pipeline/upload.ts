// Uploads out/ to Cloudflare R2. Keys come from .env.local (never committed).
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID!, secretAccessKey: R2_SECRET_ACCESS_KEY! },
});
const types: Record<string, string> = { json: 'application/json', jpg: 'image/jpeg', m4a: 'audio/mp4' };
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));

// version.json goes last, so the app never sees a new version before its files exist.
const files = walk('out').sort((a) => (a.endsWith('version.json') ? 1 : -1));
for (const f of files) {
  const key = relative('out', f);
  await s3.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: readFileSync(f), ContentType: types[key.split('.').pop()!] }));
  console.log('uploaded', key);
}
