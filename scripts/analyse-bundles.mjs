import { brotliCompressSync, gzipSync } from 'node:zlib';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const outputDirectory = resolve(process.argv[2] || 'dist/ccd-case-ui-toolkit');
const files = (await readdir(outputDirectory, { recursive: true }))
  .filter((file) => file.endsWith('.mjs') || file.endsWith('.js'))
  .sort();

const bundles = await Promise.all(
  files.map(async (file) => {
    const contents = await readFile(join(outputDirectory, file));
    return {
      file,
      bytes: contents.byteLength,
      gzipBytes: gzipSync(contents).byteLength,
      brotliBytes: brotliCompressSync(contents).byteLength,
    };
  })
);

bundles.sort((left, right) => right.bytes - left.bytes);
console.table(bundles.slice(0, 30));
await writeFile(
  join(outputDirectory, 'bundle-report.json'),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), bundles }, null, 2)}\n`
);
