import type { APIRoute } from 'astro';

export const prerender = true;

const origin = 'https://smarthome.emfls.com';

export const GET: APIRoute = () => new Response(
  [
    'User-agent: *',
    'Allow: /',
    'Disallow: /404.html',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n'),
  { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
);
