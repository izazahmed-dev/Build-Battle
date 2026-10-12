import {env} from 'cloudflare:workers';
import {sitemapResponse} from '../../server/site.mjs';
export async function GET(){return sitemapResponse(env)}
