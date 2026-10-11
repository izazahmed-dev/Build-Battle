import {handleDemo} from '../../../../server/demo.mjs';
export const dynamic='force-dynamic';
export async function GET(request:Request){return handleDemo(request)}
export async function POST(request:Request){return handleDemo(request)}
