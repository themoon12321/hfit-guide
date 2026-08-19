// GET /api/admin/check — 校验管理员密码（admin.html 登录用）
// 密码通过 Authorization: Bearer <密码> 传输，与服务端 ADMIN_SECRET 比对
// 与 /api/comments 的 _replace 校验使用同一个密钥

export async function onRequest(context) {
  const { request, env } = context;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  const auth = request.headers.get('Authorization') || '';
  if (!env.ADMIN_SECRET || auth !== 'Bearer ' + env.ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: '密码错误' }), { status: 401, headers });
  }
  return new Response(JSON.stringify({ ok: true }), { headers });
}
