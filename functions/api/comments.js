// /api/comments — 留言
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
      const data = await env.KV.get(`comments:${page}`, 'json');
      return new Response(JSON.stringify(data || []), { headers });
    }

    if (request.method === 'POST') {
      const { page, nickname, text, _replace } = await request.json();
      const key = `comments:${page || 'default'}`;

      // _replace 用于后台删除/覆盖
      if (_replace) {
        await env.KV.put(key, JSON.stringify(_replace));
        return new Response(JSON.stringify(_replace), { headers });
      }

      if (!text || text.trim().length === 0) {
        return new Response(JSON.stringify({ error: '内容不能为空' }), {
          status: 400, headers,
        });
      }
      const list = await env.KV.get(key, 'json') || [];
      list.unshift({
        id: Date.now().toString(36),
        nickname: (nickname || '匿名').trim().slice(0, 12),
        text: text.trim().slice(0, 500),
        time: new Date().toISOString(),
      });
      if (list.length > 100) list.length = 100;
      await env.KV.put(key, JSON.stringify(list));
      return new Response(JSON.stringify(list), { headers });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers,
    });
  }
}
