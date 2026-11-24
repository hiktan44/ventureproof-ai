import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export async function GET() {
  const sessionPresent = (await cookies()).has('vp_session');
  return new Response(null, {status: sessionPresent ? 403 : 204, headers: {'Cache-Control':'no-store'}});
}
