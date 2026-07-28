# 前端 Skills 使用指南

> 本指南介绍已安装的两套 Claude Code 设计技能：**emilkowalski/skills**（动效与交互实战）和 **Impeccable**（完整设计体系），以及各自的子命令/技能的使用方法和适用场景。

---

## 一、emilkowalski/skills — 动效与交互实战

**作者：** Emil Kowalski（前 Vercel / 现 Linear 设计工程师）  
**定位：** 注重微交互、动画手感、设计细节品味  
**9 个子技能：**

### 1. emil-design-eng（核心技能）
```bash
# 在对话中直接引用：
用 emil-design-eng 帮我设计这个弹窗的动画

# 或者调用技能：
/emil-design-eng
```

**用途：** 编码_UI 动画 + 设计决策_的核心技能。涵盖缓动曲线、时长、缩放、微交互等实战建议。

**关键规则：**
- 进入动画用 `ease-out`，**不要**用 `ease-in`（显得拖沓）
- UI 动画时长控制在 **300ms 以内**，弹窗最多 500ms
- 进入动画从 `scale(0.95)` 开始，**不要**从 0 开始（显得卡通）
- 只动画 `transform` 和 `opacity`，**不要**动画 `width`、`height`、`top`、`left`
- 永远添加 `prefers-reduced-motion` 回退

---

### 2. review-animations（动画审核）
```bash
用 review-animations 审核我的抽屉组件的动画
```

**用途：** 审核单个组件的动效，输出 **Before / After / Why** 对比表。

---

### 3. improve-animations（批量优化）
```bash
用 improve-animations 扫描这个项目里的所有动画并给出优化方案
```

**用途：** 扫描整个代码库，找出动画问题并排优先级。

---

### 4. find-animation-opportunities（发现动效机会）
```bash
用 find-animation-opportunities 看看这个页面哪些地方可以加动画
```

**用途：** 只读分析，找出可以加动效的 UI 元素，给出精确的动画参数建议。

---

### 5. animation-vocabulary（动画词典）
```bash
用 animation-vocabulary 把"弹窗打开时那个弹跳效果"翻译成动画术语
```

**用途：** 把模糊描述转成精确的动画术语（如 "Pop in"、"Rubber-banding"），方便跟设计师沟通或写 prompt。

---

### 6. apple-design（Apple 设计原则）
```bash
用 apple-design 帮我设计这个拖拽交互
```

**用途：** 将 Apple WWDC 设计原则翻译到 Web 场景：弹性动画、物理感交互、半透明材质、活字排印、视觉层次等。

---

### 7. pick-ui-library（选 UI 库）
```bash
用 pick-ui-library 帮我选一个适合这个项目的 UI 组件库
```

**用途：** 根据项目需求推荐合适的 UI 库，避免手写轮子。

---

### 8. prototype（快速原型）
```bash
用 prototype 帮我设计一个图片翻页浏览的原型
```

**用途：** 快速搭建可交互原型探索设计方案。

---

## 二、Impeccable — 完整设计体系

**作者：** Paul Bakaus（jQuery UI 联合创始人，前 Google PM）  
**定位：** 整套设计语言系统，含反模式检测  
**23 个命令：**

### 快速上手

```bash
# 1. 初始化项目（首次使用）
/impeccable init

# 2. 从头设计一个新界面
/impeccable craft

# 3. 审核现有界面
/impeccable audit

# 4. 打磨上线
/impeccable polish
```

### 常用命令一览

| 命令 | 用途 | 什么时候用 |
|------|------|-----------|
| `/impeccable init` | 项目初始化，生成 `PRODUCT.md` 和 `DESIGN.md` | **第一次用 Impeccable 时** |
| `/impeccable craft` | 从零开始设计，shape-then-build 流程 | **新建页面/组件时** |
| `/impeccable audit` | 技术质量检查（可访问性、性能、响应式） | **上线前检查** |
| `/impeccable critique` | UX 设计评审（信息层级、清晰度、情感共鸣） | **设计稿完成后** |
| `/impeccable polish` | 上线前最终的品质打磨 | **准备发布前** |
| `/impeccable distill` | 提炼简化复杂界面 | **页面太乱需要简化时** |
| `/impeccable animate` | 动画设计建议 | **需要加动效时** |
| `/impeccable colorize` | 颜色系统设计 | **定主题色/配色时** |
| `/impeccable typeset` | 字体排版设计 | **定字体/字号系统时** |
| `/impeccable layout` | 布局设计 | **页面结构布局时** |
| `/impeccable adapt` | 响应式适配 | **需要适配移动端时** |

### 反模式检测

Impeccable 内置 **58 条检测规则**，能自动识别 AI 生成的常见设计问题：

```bash
# 单独运行检测器
npx impeccable detect src/
```

检测内容包括：
- 过度使用圆角、卡片、阴影
- 千篇一律的紫蓝渐变配色
- 灰色文字配彩色背景
- 图标在上、标题在下的固定模式

---

## 三、在宿舍尺寸项目中的使用建议

### 当前阶段（搭建网站）

```bash
# 1. 初始化 Impeccable 设计规范
/impeccable init

# 2. 设计页面布局
/impeccable craft

# 3. 设计翻图浏览的交互动画
用 emil-design-eng 设计图片浏览的过渡动画

# 4. 设计提示气泡的入场动效
用 review-animations 审核气泡提示的动画效果

# 5. 总体视觉风格参考
用 apple-design 设计清爽简洁的视觉风格
```

### 未来阶段（个人知识库）

```bash
# 扩展为多页面站点时
/impeccable layout  # 设计导航布局
/impeccable typeset # 统一排版
/impeccable colorize # 统一配色
```

---

## 四、注意事项

1. **Impeccable 安全评级为 Med Risk** — 因为它可以读写项目文件。扫描安装时的安全审查结果为：Socket 0 alerts、Snyk Med Risk。建议使用前了解其行为。
2. **先 init 再 craft** — Impeccable 的 `init` 命令会生成产品/设计文档，后续命令依赖这些上下文。
3. **两套互补** — emilkowalski 偏动效手感，Impeccable 偏设计体系。做 UI 动画时优先用 emilkowalski，做整体设计决策时优先用 Impeccable。
4. **全局已安装** — 在任何项目中都可以通过 `/impeccable` 或各技能名直接调用。
