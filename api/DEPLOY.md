# 部署指南

## 前提
- 有 Cloudflare 账号（你的网站已经部署在 Cloudflare Pages，用同一个账号）
- 安装了 Node.js

## 第一步：安装 Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

## 第二步：创建 KV 命名空间

```bash
wrangler kv:namespace create "KV"
```

输完后会返回一个 ID，类似 `abc123...`。把这个 ID 填到 `api/wrangler.toml` 里的 `id = "你的KV命名空间ID"`。

## 第三步：部署 Worker

```bash
cd api
wrangler deploy
```

部署成功后你会得到一个 URL，类似 `https://hfit-guide-api.xxxx.workers.dev`

## 第四步：配置前端

在 `api/widget-demo.html` 中找到第 107-108 行：

```js
const API_BASE = 'https://你的worker域名.workers.dev';
```

改成你的 Worker 地址。

然后把这个组件嵌入到你的页面中（复制 HTML + CSS + JS 到目标页面的合适位置）。

## 第五步（可选）：绑定自定义域名

在 Cloudflare 控制台 → Workers → 你的 Worker → Triggers → Custom Domain，填 `api.hfit-guide.pages.dev`，这样就变成你自己的域名了：

```js
// 改前
const API_BASE = 'https://hfit-guide-api.xxxx.workers.dev';
// 改后
const API_BASE = 'https://api.hfit-guide.pages.dev';
```
