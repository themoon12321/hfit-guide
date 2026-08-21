// /api/likes — 点赞
// 部署到 Cloudflare Pages Functions，需要绑定 KV 命名空间
// 加固：page 白名单 + delta 只允许 ±1（防刷任意数值）+ 同 IP 每小时限流

const ALLOWED_PAGES = ['portal', 'dorm', 'faq', 'layouts'];

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
      const item = url.searchParams.get('item');
      const ids = url.searchParams.get('ids');

      // 批量获取指定条目 id 的赞数（逐个读取，强一致；避免 KV.list 的最终一致性延迟）
      if (ids) {
        const counts = {};
        const list = ids.split(',').filter(function(x) { return ITEM_RE.test(x); });
        await Promise.all(list.map(async (id) => {
          const val = parseInt(await env.KV.get(`likes:${page}:${id}`) || '0');
          counts[id] = val;
        }));
        return new Response(JSON.stringify(counts), { headers });
      }

      const key = item ? `likes:${page}:${item}` : `likes:${page}`;
      const count = parseInt(await env.KV.get(key) || '0');
      return new Response(JSON.stringify({ count }), { headers });
    }

    if (request.method === 'POST') {
      const { page, item, delta } = await request.json();
      if (!ALLOWED_PAGES.includes(page || '')) {
        return new Response(JSON.stringify({ error: '未知页面' }), { status: 400, headers });
      }
      // 条目 id 格式校验（防写入任意 key）
      if (item !== undefined && item !== null && !/^[a-zA-Z0-9_-]{1,32}$/.test(item)) {
        return new Response(JSON.stringify({ error: '参数错误' }), { status: 400, headers });
      }
      // 只允许 +1 / -1，防止一次刷任意数值或清零
      const d = parseInt(delta);
      if (d !== 1 && d !== -1) {
        return new Response(JSON.stringify({ error: '参数错误' }), { status: 400, headers });
      }
      // 简单限流：同 IP 每小时最多 60 次（点赞比留言频繁，阈值放宽）
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rlKey = `rl-like:${ip}:${Math.floor(Date.now() / 3600000)}`;
      const rlCount = parseInt(await env.KV.get(rlKey) || '0');
      if (rlCount >= 60) {
        return new Response(JSON.stringify({ error: '操作太频繁，请稍后再试' }), { status: 429, headers });
      }
      await env.KV.put(rlKey, String(rlCount + 1), { expirationTtl: 3700 });

      const key = item ? `likes:${page}:${item}` : `likes:${page}`;
      const current = parseInt(await env.KV.get(key) || '0');
      const next = Math.max(0, current + d);
      await env.KV.put(key, String(next));
      return new Response(JSON.stringify({ count: next }), { headers });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers,
    });
  }
}
