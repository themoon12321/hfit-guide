// 小程序数据文件（纯展示版：无任何网络请求，全部本地数据）
// 数据来源：与网页版 data.js 保持同步（内容更新时手动同步）

const COS = 'https://hfit-guide-1459922161.cos.ap-nanjing.myqcloud.com';

// ===== 宿舍尺寸图（16 张，标注图） =====
const IMAGES = [
  { id: 'D01', cat: 'desk',   label: '书桌 — 主正视图' },
  { id: 'D02', cat: 'desk',   label: '书桌下方 — 带柜完整视图' },
  { id: 'D03', cat: 'desk',   label: '书桌下方 — 正视图' },
  { id: 'D07', cat: 'desk',   label: '书桌右下 — 两层小柜图' },
  { id: 'D09', cat: 'desk',   label: '书桌 — 正面后挡板视图' },
  { id: 'D10', cat: 'desk',   label: '书桌 — 线缆开口直径图' },
  { id: 'B01', cat: 'bed',    label: '床板 — 视图' },
  { id: 'B02', cat: 'bed',    label: '床板 — 层高视图' },
  { id: 'S01', cat: 'stairs', label: '楼梯斜视图' },
  { id: 'S02', cat: 'stairs', label: '楼梯柜视图一' },
  { id: 'C01', cat: 'closet', label: '衣柜 — 闭门视图' },
  { id: 'C02', cat: 'closet', label: '衣柜上层开门视图' },
  { id: 'C03', cat: 'closet', label: '衣柜下方开门视图' },
  { id: 'C04', cat: 'closet', label: '衣柜顶部缝隙视图' },
  { id: 'P01', cat: 'space',  label: '一四号床位 — 侧边空间示意图' },
  { id: 'P02', cat: 'space',  label: '二三号床位 — 侧边空间示意图' },
];

// 分类（首页入口按分组展示）
const CATS = [
  { id: 'desk',   label: '书桌',   icon: '🪑' },
  { id: 'bed',    label: '床',     icon: '🛏️' },
  { id: 'stairs', label: '楼梯',   icon: '🪜' },
  { id: 'closet', label: '衣柜',   icon: '🗄️' },
  { id: 'space',  label: '空间',   icon: '📐' },
];

// ===== 尺寸速查（来自热点经验文字中的真实数据；其余待站长补充） =====
const QUICK = [
  { item: '书桌后挡板', value: '约 8cm 多', note: '影响显示器支架安装，可配板子延伸' },
  { item: '鼠标垫', value: '70 × 40cm', note: '大多数周边鼠标垫尺寸，刚好塞进书桌' },
  { item: '洞洞板', value: '40 × 34cm', note: '洞洞板需用无痕贴固定；覆盖全平面可定制 58×56' },
  { item: '显示器尺寸', value: '27 寸为极限', note: '主流搭配 24/27 寸；侧边竖屏建议 24 寸' },
];

// ===== FAQ（与网页版同步；a 字段为富文本，小程序 rich-text 渲染） =====
const FAQ = [
  {
    id: 'q1',
    q: '关于选课（抢课）',
    a: '<span>目前只有两种课程需要选择：<strong>大学体育课</strong>和<strong>公选课</strong>。大一上学期只有体育课需要选择。<br><br>选课共三轮：<strong>第一轮</strong>随机分配；<strong>第二轮</strong>先到先得（需要抢课，注意提前进入）；<strong>第三轮</strong>为候补（作者未经历，不确定）。<br><br>tips：选课需根据课表时间，不是每门课都在选择范围内。</span>',
    tags: ['上课'],
  },
  {
    id: 'q2',
    q: '关于校内交通',
    a: '<span>校园内学生不允许骑行电瓶车，主流交通工具为<strong>自行车</strong>（也有滑板、平衡车，但自行车最方便保险）。自行车原则上不能停宿舍楼下，男寝须停车棚。<br><br>tips：学校不算特别大但宿舍到学院楼往返不近，推荐配备自行车。</span>',
    tags: ['校园', '交通'],
  },
  {
    id: 'q3',
    q: '关于校外交通（去合肥）',
    a: '<span>去合肥市区主要有几种方式：<br><br><strong>1. 黄麓高校专线</strong>：单程 6 元，不支持优惠；途经学校南门和西门，到滨湖融创茂；建议提前到站。<br><br><strong>2. 周末校车</strong>：免费，师生凭校园一卡通；注意周五/周六/周日不同时刻。<br><br><strong>3. 公交 H105</strong>：10 元单程，学校东门无站牌可招手停；从客运中心返回需身份证买票。<br><br><strong>4. 小程序高校专线</strong>（节假日）：需提前预订，人不够会退票。<br><br><strong>5. 打车</strong>：一般在百元以内。<br><br><strong>6. 顺风车</strong>：比打车便宜。</span>',
    tags: ['交通'],
    images: [COS + '/img/faq/bus-map-01.jpg', COS + '/img/faq/bus-map-02.jpg'],
  },
  {
    id: 'q4',
    q: '关于学校附近交通',
    a: '<span>附近主要去<strong>半岛商业广场</strong>（约 5 公里）和<strong>欧菲光</strong>（约 2 公里）。<br><br><strong>共享电瓶车</strong>：西门门口有，2.5 元/首 20 分钟 + 2.0 元/续 20 分钟，24 小时封顶 25 元；需要提前充值。<br><br>雨天或多人出行打车更划算；晚上附近路灯会关，不建议夜间骑车。</span>',
    tags: ['交通'],
  },
];

const FAQ_UPDATED = '2026-08-21';

module.exports = {
  COS,
  IMAGES,
  CATS,
  QUICK,
  FAQ,
  FAQ_UPDATED,
};
