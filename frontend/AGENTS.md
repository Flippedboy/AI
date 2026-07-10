# UI 设计指南

> **设计类型**: App 设计（应用架构设计）
> **确认检查**: 本指南适用于可交互的应用/网站/工具。

> ℹ️ Section 1 为设计意图与决策上下文。Code agent 实现时以 Section 2 及之后的具体参数为准。

## 1. Design Archetype (设计原型)

### 1.1 内容理解

- **目标用户**: 扫地机器人用户与运营人员；高频使用客服对话与数据看板，需高效获取信息且感受科技信任感
- **核心目的**: 建立信任 + 引导行动（精准问答、文档管理、数据洞察）
- **情绪基调**: 沉浸科技感 / 专业冷静；避免廉价光效、信息过载焦虑

### 1.2 设计方向

- **Design Style**: Frosted Glass 毛玻璃 — 深蓝科技基底+磨砂质感呼应RAG智能AI的"透明思考"隐喻，半透明层叠强化信息层级
- **Application Type**: SaaS/Admin（多模块Web应用）— 决定侧边导航+高视口利用率布局
- **Aesthetic Direction**: 深邃海军蓝底色上悬浮发光玻璃面板，数据如星辰般在暗场中清晰浮现

## 2. Color System (色彩系统)

**色彩关系**: 深海蓝主色(#1e3a5f) + 亮蓝交互色(#2563eb) + 极浅蓝灰背景底 + 白色文字
**配色设计理由**: 深蓝传递AI科技权威感，玻璃拟态需深色基底才能显现磨砂光影层次
**主色推导**: primary取自概要设计指定的#2563eb，作为AI回复气泡、按钮、激活态的唯一行动色
**使用比例**: 70%深蓝背景/容器 · 20%玻璃白(半透明) · 10%亮蓝primary；primary仅用于CTA、消息气泡、图表关键线

### 2.1 主题颜色

| Token                | HSL 值                  | 说明                                       |
| -------------------- | ----------------------- | ------------------------------------------ |
| `background`         | hsl(215, 40%, 12%)      | 页面深蓝底色，玻璃拟态基底                 |
| `card`               | hsl(215, 30%, 18%, 0.6) | 玻璃卡片背景，60%透明度+backdrop-blur     |
| `foreground`         | hsl(210, 40%, 96%)      | 主文字，近白微蓝确保暗底可读               |
| `muted-foreground`   | hsl(215, 20%, 65%)      | 次要文字/时间戳/标签                       |
| `primary`            | hsl(217, 91%, 60%)      | 主交互色(#2563eb)，按钮/AI气泡/激活态      |
| `primary-foreground` | hsl(0, 0%, 100%)        | 主交互文字                                 |
| `accent`             | hsl(215, 30%, 25%, 0.5) | 次级交互反馈(hover/focus/skeleton背景)     |
| `accent-foreground`  | hsl(210, 40%, 90%)      | accent上的文字                             |
| `border`             | hsl(215, 30%, 35%, 0.3) | 玻璃边框，低透明度营造边缘光感             |

### 2.2 导航区配色

- **基调关系**: 复用主配色系统，侧边栏用更深的`hsl(215, 40%, 10%, 0.8)`半透明玻璃底板区分层级
- **关键状态**: 激活项用`bg-primary/20`+左侧3px亮蓝指示条；hover用`bg-accent`；文字对比度≥4.5:1
- **边界与背景**: 右侧1px `border-white/5`分隔线；非透明深色玻璃基底

### 2.3 语义颜色

| 用途       | HSL 值                   | 衍生逻辑                          |
| ---------- | ------------------------ | --------------------------------- |
| 成功/已索引 | hsl(150, 60%, 45%)       | 绿色系，边框中饱和，背景低饱和高明度 |
| 警告/处理中 | hsl(40, 85%, 55%)        | 橙黄色系，仅大字号或深色变体使用    |
| 错误/失败  | hsl(0, 70%, 55%)         | 红色系，同成功色衍生逻辑           |

## 3. Typography (字体排版)

- **Heading**: Space Grotesk, ui-sans-serif, system-ui, sans-serif
- **Body**: Inter, ui-sans-serif, system-ui, sans-serif
- **字体策略**: Space Grotesk几何感强化科技标题识别度；Inter保障中文混排与数据可读性；回退栈覆盖全平台

## 4. Layout Strategy (布局策略)

- **导航意图**: 持久型全局侧边导航（5个功能模块切换）；至多一套；非透明深色玻璃基底；移动端折叠为底部TabBar
- **页面架构**: 侧边栏+主内容区双区布局；主内容区`max-w-[1400px]`居中；各页面共享统一容器宽度
- **响应式**: 桌面端侧边导航+宽内容区；移动端隐藏侧边栏，底部固定TabBar导航+全宽内容流

## 5. Visual Language (视觉语言)

- **形态参数**: 圆角 `rounded-xl (0.75rem)` · 阴影 `shadow-lg + shadow-primary/5` · 间距基调 `spacious (gap-6/p-6)`
- **识别签名**: 「所有容器backdrop-blur-md磨砂质感」「AI气泡左对齐渐变蓝+打字光标」「KPI数字text-4xl font-bold + 环比箭头动态着色」
- **装饰策略**: 仅用玻璃边框微光(border-white/5~10%)和primary渐变气泡两种手法，禁止额外装饰纹理
- **动效原则**: 消息滑入+淡入300ms ease-out；hover上浮translate-y-[-2px] 200ms；主题切换transition-colors 300ms全局过渡
- **可及性**: 正文对比度≥4.5:1；玻璃背景文字指定`text-foreground`(hsl(210,40%,96%))；交互元素有明确focus ring

## 6. Component Principles (组件原则)

- **状态完整性**: Button/Input/Card均覆盖Default/Hover/Focus/Disabled；玻璃容器hover时border-opacity从5%升至10%+轻微上浮
- **层级清晰**: Primary按钮实心亮蓝填充；Secondary/Ghost按钮透明底+border-white/10；AI消息渐变蓝气泡vs用户消息纯色气泡
- **一致性**: 状态Badge统一胶囊形(rounded-full)+语义色背景(20%透明度)+同色相文字；所有卡片统一glass morphism样式

## 7. Image Direction (图片与视觉资产)

- **Image Role**: 无强制图片需求，优先通过玻璃拟态排版、深蓝渐变和局部光影建立视觉记忆点
- **Image Art Direction**: 无
- **Image Prompt Keywords**: 无
- **Image Avoidance**: 避免通用AI机器人插画、蓝色科技感抽象线条图、商务人物素材、无主题渐变背景

## 8. 应避免 (Anti-patterns)

- ❌ 纯黑#000背景替代深蓝基底（丧失玻璃拟态的色彩深度与品牌辨识度）
- ❌ AI回复气泡使用纯色而非渐变蓝（失去"正在思考"的动态感知与标志性时刻）
- ❌ 玻璃容器缺少backdrop-blur或border微光（退化为普通半透明色块，丧失材质质感）