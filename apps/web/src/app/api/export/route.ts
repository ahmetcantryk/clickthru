import { getDemo } from '@/lib/demos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PER_STEP_MS = 3600;

/** Video/GIF export — render-worker'a (Playwright+ffmpeg) proxy. */
export async function POST(req: Request): Promise<Response> {
  let body: { demoId?: string; format?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'geçersiz istek' }, { status: 400 });
  }

  const demoId = body.demoId;
  const format = body.format === 'gif' ? 'gif' : body.format === 'webm' ? 'webm' : 'mp4';
  if (!demoId) return Response.json({ error: 'demoId gerekli' }, { status: 400 });

  const worker = process.env.RENDER_WORKER_URL;
  if (!worker) {
    return Response.json({ error: 'render worker yapılandırılmadı' }, { status: 503 });
  }

  const origin = new URL(req.url).origin;
  const url = `${origin}/embed/${demoId}?export=1`;

  // Oynatma süresini adım sayısından kestir (kayıt bu kadar sürer).
  const demo = await getDemo(demoId).catch(() => null);
  const steps = demo ? demo.steps.filter((s) => !s.skip).length : 6;
  const durationMs = steps * PER_STEP_MS + 1500;

  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (process.env.RENDER_SECRET) headers.authorization = `Bearer ${process.env.RENDER_SECRET}`;

  try {
    const r = await fetch(`${worker.replace(/\/$/, '')}/render`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url, format, durationMs, width: 1280, height: 800 }),
    });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return new Response(`render-worker hatası: ${text.slice(0, 300)}`, { status: 502 });
    }
    const buf = await r.arrayBuffer();
    const ct = format === 'gif' ? 'image/gif' : format === 'webm' ? 'video/webm' : 'video/mp4';
    return new Response(buf, {
      headers: {
        'content-type': ct,
        'content-disposition': `attachment; filename="${demoId}.${format}"`,
        'cache-control': 'no-store',
      },
    });
  } catch (e) {
    return new Response(`render-worker'a ulaşılamadı: ${e instanceof Error ? e.message : 'hata'}`, { status: 502 });
  }
}
