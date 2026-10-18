import {readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_FILE = path.join(SRC, 'config', 'affiliate.ts');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      return sourceFiles(full);
    }
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : [];
  });
}

describe('affiliate configuration', () => {
  const files = sourceFiles(SRC);

  it('defines the affiliate link in exactly one file', () => {
    const withPlaceholder = files.filter((f) =>
      readFileSync(f, 'utf8').includes('TWOJ-LINK-AFILIACYJNY'),
    );
    expect(withPlaceholder.map((f) => path.relative(SRC, f))).toEqual(
      expect.arrayContaining([path.relative(SRC, CONFIG_FILE)]),
    );
    // lib/affiliate.ts only references the placeholder to detect it.
    for (const file of withPlaceholder) {
      expect([CONFIG_FILE, path.join(SRC, 'lib', 'affiliate.ts')]).toContain(file);
    }
    const definitions = files.filter((f) =>
      /export const AFFILIATE_URL\b/.test(readFileSync(f, 'utf8')),
    );
    expect(definitions).toEqual([CONFIG_FILE]);
  });

  it('only builds outgoing CTA hrefs in AffiliateLink', () => {
    const users = files.filter((f) => readFileSync(f, 'utf8').includes('buildAffiliateUrl('));
    expect(users.map((f) => path.relative(SRC, f)).sort()).toEqual(
      ['components/AffiliateLink.tsx', 'lib/affiliate.ts'].map((p) => path.normalize(p)),
    );
  });
});
