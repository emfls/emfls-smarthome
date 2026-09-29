import type { APIRoute } from 'astro';

export const prerender = true;

const origin = 'https://smarthome.emfls.com';
const paths = ['/', '/about/', '/privacy/', '/contact/', '/editorial-policy/'];

export const GET: APIRoute = () => new Response(
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
    .map((route) => `  <url><loc>${origin}${route}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
  { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
);
