import { NextRequest, NextResponse } from 'next/server';

const KEY = 'planungskompass-data';

// In-memory fallback so local dev works without a KV database attached.
// On Vercel, use a real KV store — this fallback resets on every cold start.
let memoryFallback: unknown = null;

async function getKv() {
  try {
    const mod = await import('@vercel/kv');
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      return mod.kv;
    }
  } catch {
    // package not resolvable or KV not configured
  }
  return null;
}

export async function GET() {
  const kv = await getKv();
  if (kv) {
    const value = await kv.get(KEY);
    return NextResponse.json({ value });
  }
  return NextResponse.json({ value: memoryFallback });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (body === null) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
  const kv = await getKv();
  if (kv) {
    await kv.set(KEY, body);
  } else {
    memoryFallback = body;
  }
  return NextResponse.json({ ok: true });
}
