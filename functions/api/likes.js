// /api/likes — 点赞
// 部署到 Cloudflare Pages Functions，需要绑定 KV 命名空间

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    if (request.method === 'GET') {
      const page = url.searchParams.get('page') || 'default';
      const count = parseInt(await env.KV.get(`likes:${page}`) || '0');
      return new Response(JSON.stringify({ count }), { headers });
    }

    if (request.method === 'POST') {
      const { page } = await request.json();
      const key = `likes:${page || 'default'}`;
      const current = parseInt(await env.KV.get(key) || '0');
      await env.KV.put(key, String(current + 1));
      return new Response(JSON.stringify({ count: current + 1 }), { headers });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers,
    });
  }
}
