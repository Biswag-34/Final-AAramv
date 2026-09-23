import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { catalogSchema } from '../lib/catalog-schema.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = async name => JSON.parse(await readFile(path.join(root, name), 'utf8'));
const catalog = catalogSchema.safeParse({ properties: await read('data/properties.json'), localities: await read('data/localities.json') });
if (!catalog.success) {
  for (const issue of catalog.error.issues) console.error(`${issue.path.join('.')}: ${issue.message}`);
  process.exitCode = 1;
} else {
  const publicRoot = path.join(root, 'public');
  const localAssets = [...catalog.data.properties, ...catalog.data.localities].flatMap(record => [
    ...record.images.map(image => ({ owner: record.id, src: image.src })),
    ...('documents' in record ? record.documents.filter(doc => doc.url).map(doc => ({ owner: record.id, src: doc.url })) : []),
  ]).filter(asset => asset.src.startsWith('/'));
  for (const asset of localAssets) {
    const resolved = path.resolve(publicRoot, decodeURIComponent(asset.src.split(/[?#]/)[0].slice(1)));
    if (!resolved.startsWith(publicRoot + path.sep)) { console.error(`${asset.owner}: asset escapes public: ${asset.src}`); process.exitCode = 1; continue; }
    try { await access(resolved); } catch { console.error(`${asset.owner}: missing public asset ${asset.src}`); process.exitCode = 1; }
  }
  if (!process.exitCode) console.log(`Validated ${catalog.data.properties.length} properties, ${catalog.data.localities.length} localities and ${localAssets.length} local asset references.`);
}
