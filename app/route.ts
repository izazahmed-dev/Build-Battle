import html from '../web/index.html?raw';
import {env} from 'cloudflare:workers';
export async function GET() {
  const content=html.replace('</head>',`<meta name="insightflow-demo" content="${env.PUBLIC_DEMO==='true'}"></head>`);
  return new Response(content, {headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
}
