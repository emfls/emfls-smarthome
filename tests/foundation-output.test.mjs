import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const origin = 'https://smarthome.emfls.com';
const publicRoutes = [
  { path: '/', file: 'index.html' },
  { path: '/about/', file: 'about/index.html' },
  { path: '/privacy/', file: 'privacy/index.html' },
  { path: '/contact/', file: 'contact/index.html' },
  { path: '/editorial-policy/', file: 'editorial-policy/index.html' },
];

async function html(file) {
  return readFile(path.join(dist, file), 'utf8');
}

function namedMeta(source, name) {
  return source.match(new RegExp(`<meta\\b(?=[^>]*\\bname=["']${name}["'])[^>]*>`, 'i'))?.[0] ?? null;
}

function pageMetadata(source) {
  return {
    title: source.match(/<title>(.*?)<\/title>/is)?.[1]?.trim() ?? '',
    description: namedMeta(source, 'description')?.match(/\bcontent=["']([^"']*)["']/i)?.[1] ?? null,
    canonical: source.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i)?.[0]
      ?.match(/\bhref=["']([^"']*)["']/i)?.[1] ?? null,
    robots: namedMeta(source, 'robots')?.match(/\bcontent=["']([^"']*)["']/i)?.[1] ?? null,
  };
}

test('foundation routes have unique, useful Korean metadata and canonical URLs while the launch gate is pending', async () => {
  const pages = await Promise.all(publicRoutes.map(async (route) => ({
    route,
    source: await html(route.file),
  })));
  const titles = pages.map(({ source }) => pageMetadata(source).title);
  const descriptions = pages.map(({ source }) => pageMetadata(source).description);

  assert.equal(new Set(titles).size, publicRoutes.length, 'every public page needs a distinct title');
  assert.equal(new Set(descriptions).size, publicRoutes.length, 'every public page needs a distinct description');

  for (const { route, source } of pages) {
    const metadata = pageMetadata(source);
    assert.ok(metadata.title.length >= 12, `${route.path} needs a descriptive title`);
    assert.ok(metadata.description?.length >= 45, `${route.path} needs a useful description`);
    assert.equal(metadata.canonical, `${origin}${route.path}`, `${route.path} needs the HTTPS custom-domain canonical`);
    assert.equal(metadata.robots?.toLowerCase().replaceAll(' ', ''), 'noindex,follow', `${route.path} stays out of indexes before the gate`);
    assert.doesNotMatch(source, /initial technical bootstrap|lorem ipsum|TODO/i, `${route.path} must not be placeholder content`);
    for (const trustRoute of publicRoutes.slice(1)) {
      assert.match(source, new RegExp(`href=["']${trustRoute.path.replaceAll('/', '\\/')}["']`), `${route.path} needs navigation to ${trustRoute.path}`);
    }
  }

  const home = pages[0].source;
  for (const concept of ['센서', '조건', '자동화', '결과', 'Matter']) {
    assert.ok(home.includes(concept), `home page needs topic-specific explanation containing ${concept}`);
  }
});

test('robots and sitemap cover the public foundation routes only', async () => {
  const robots = await readFile(path.join(dist, 'robots.txt'), 'utf8');
  const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
  assert.match(robots, new RegExp(`Sitemap:\\s*${origin.replaceAll('.', '\\.')}\\/sitemap\\.xml`, 'i'));

  for (const route of publicRoutes) {
    assert.ok(sitemap.includes(`<loc>${origin}${route.path}</loc>`), `sitemap is missing ${route.path}`);
  }
  assert.doesNotMatch(sitemap, /\/404(?:\.html|\/)?<\/loc>/i, '404 must not be in the sitemap');
});

test('custom 404 is helpful, non-indexable, and excluded from the sitemap', async () => {
  const notFound = await html('404.html');
  const metadata = pageMetadata(notFound);
  assert.match(notFound, /페이지를 찾을 수 없|찾을 수 없는 페이지/i);
  assert.match(notFound, /href=["']\/["']/);
  assert.equal(metadata.robots?.toLowerCase().replaceAll(' ', ''), 'noindex,follow');
  assert.equal(metadata.canonical, null, 'the 404 page should not advertise a canonical URL');
});

test('IndexNow key is a 64-hex public token with a matching hosted key file', async () => {
  const files = await readdir(dist);
  const keyFiles = files.filter((file) => /^[a-f0-9]{64}\.txt$/i.test(file));
  assert.equal(keyFiles.length, 1, 'expected exactly one 64-hex IndexNow key file at the site root');
  const key = keyFiles[0].slice(0, -4);
  assert.equal((await readFile(path.join(dist, keyFiles[0]), 'utf8')).trim(), key);
});
