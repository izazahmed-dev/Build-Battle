import {env} from 'cloudflare:workers';
import {robotsResponse} from '../../server/site.mjs';
export async function GET(){return robotsResponse(env)}
