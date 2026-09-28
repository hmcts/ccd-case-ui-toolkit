import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const palette = join(root, 'projects/ccd-case-ui-toolkit/src/lib/shared/components/palette');
const classification = JSON.parse(readFileSync(join(root, 'playwright_tests/coverage-classification.json'), 'utf8'));
const coverage = readFileSync(join(root, 'playwright_tests/COVERAGE.md'), 'utf8');

const paletteEntries = readdirSync(palette, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const missing = paletteEntries.filter((entry) => !classification[entry]);
const stale = Object.keys(classification).filter((entry) => !paletteEntries.includes(entry));
const uncited = Object.entries(classification)
  .filter(([, rows]) => rows.split(' / ').some((row) => !coverage.includes(`| ${row} |`)));

if (missing.length || stale.length || uncited.length) {
  if (missing.length) {
    console.error(`Missing coverage classification for palette entries: ${missing.join(', ')}`);
  }
  if (stale.length) {
    console.error(`Stale coverage classification entries: ${stale.join(', ')}`);
  }
  if (uncited.length) {
    console.error(`Coverage classifications reference rows absent from COVERAGE.md: ${uncited.map(([entry, row]) => `${entry} -> ${row}`).join(', ')}`);
  }
  process.exit(1);
}
