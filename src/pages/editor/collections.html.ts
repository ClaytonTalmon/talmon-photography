import type { APIRoute } from 'astro';
import source from '../../../tools/Collection_Editor.html?raw';
import bridge from '../../scripts/collection-bridge.js?raw';
export const prerender = true;
export const GET: APIRoute = () => new Response(source.replace('<meta charset="utf-8">', '<meta charset="utf-8"><meta name="robots" content="noindex, nofollow">').replace('</html>', `<script>${bridge}</script></html>`), {
  headers: { 'Content-Type': 'text/html; charset=utf-8' },
});
