// /api/comments — 留言
// 部署到 Cloudflare Pages Functions，需要绑定 KV 命名空间
// 环境变量: ADMIN_SECRET —— 所有读取/管理操作的密钥，只在服务端使用，不要写进前端代码
// 权限模型：留言仅管理员可见（GET 需密钥）；匿名用户仍可提交（POST 无需密钥）

function isAuthed(request, env) {
  const auth = request.headers.get('Authorization') || '';
  return !!(env.ADMIN_SECRET && auth === 'Bearer ' + env.ADMIN_SECRET);
}

// 留言归属页面白名单：新增有留言功能的页面时，把页面 id 加进来
const ALLOWED_PAGES = ['portal', 'dorm', 'faq'];

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    if (request.method === 'GET') {
      // 留言仅管理员可见：读取必须携带密钥
      if (!isAuthed(request, env)) {
        return new Response(JSON.stringify({ error: '未授权' }), { status: 401, headers });
      }
      const page = url.searchParams.get('page') || 'default';
      const data = await env.KV.get(`comments:${page}`, 'json');
      return new Response(JSON.stringify(data || []), { headers });
    }

    if (request.method === 'POST') {
      const { page, nickname, text, _replace } = await request.json();
      if (!ALLOWED_PAGES.includes(page || '')) {
        return new Response(JSON.stringify({ error: '未知页面' }), { status: 400, headers });
      }
      const key = `comments:${page || 'default'}`;

      // _replace 用于后台删除/覆盖 —— 必须携带管理员密钥，否则任何人可清空留言
      if (_replace) {
        if (!isAuthed(request, env)) {
          return new Response(JSON.stringify({ error: '未授权' }), { status: 401, headers });
        }
        await env.KV.put(key, JSON.stringify(_replace));
        return new Response(JSON.stringify(_replace), { headers });
      }

      if (!text || text.trim().length === 0) {
        return new Response(JSON.stringify({ error: '内容不能为空' }), {
          status: 400, headers,
        });
      }

      // 基础过滤：拒绝带链接的内容（防广告刷屏）
      if (/https?:\/\/|www\./i.test(text)) {
        return new Response(JSON.stringify({ error: '内容包含链接，已拦截' }), {
          status: 400, headers,
        });
      }

      // 简单限流：同 IP 每小时最多 10 条
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rlKey = `rl:${ip}:${Math.floor(Date.now() / 3600000)}`;
      const count = parseInt(await env.KV.get(rlKey) || '0');
      if (count >= 10) {
        return new Response(JSON.stringify({ error: '发送太频繁，请稍后再试' }), {
          status: 429, headers,
        });
      }
      await env.KV.put(rlKey, String(count + 1), { expirationTtl: 3700 });

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
