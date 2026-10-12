import {env} from 'cloudflare:workers';
import {handleAnalytics} from '../../../server/analytics.mjs';
export const dynamic='force-dynamic';
export async function POST(request:Request){return handleAnalytics(request,env)}
// No unauthenticated metrics read endpoint. Delegate unsupported methods so
// callers receive the same 405/no-store contract as the core handler.
export async function GET(request:Request){return handleAnalytics(request,env)}
export async function PUT(request:Request){return handleAnalytics(request,env)}
export async function PATCH(request:Request){return handleAnalytics(request,env)}
export async function DELETE(request:Request){return handleAnalytics(request,env)}
export async function OPTIONS(request:Request){return handleAnalytics(request,env)}
export async function HEAD(request:Request){return handleAnalytics(request,env)}
