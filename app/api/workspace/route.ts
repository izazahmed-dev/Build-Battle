import {env} from 'cloudflare:workers';
import {handleWorkspace} from '../../../server/workspace.mjs';
export const dynamic='force-dynamic';
export async function GET(request:Request){return handleWorkspace(request,env)}
export async function POST(request:Request){return handleWorkspace(request,env)}
