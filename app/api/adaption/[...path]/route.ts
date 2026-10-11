import {env} from 'cloudflare:workers';
import {handleAdaption} from '../../../../server/adaption.mjs';
export const dynamic = 'force-dynamic';
export async function GET(request:Request) { return handleAdaption(request, env); }
export async function POST(request:Request) { return handleAdaption(request, env); }
