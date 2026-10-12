import html from '../web/index.html?raw';
import {env} from 'cloudflare:workers';
import {renderSite} from '../server/site.mjs';
export const dynamic='force-dynamic';
export async function GET(request:Request){return renderSite(html,request,env)}
