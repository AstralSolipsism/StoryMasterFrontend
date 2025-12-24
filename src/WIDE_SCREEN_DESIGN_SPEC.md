# 宽屏适配：功能增强模式设计规范

## 1. 核心理念：冒险家的书桌 (The Adventurer's Desk)

在超宽屏幕（>1600px）下，我们不再仅仅展示一本书，而是展示**摆放着书本的整个书桌**。
这个“书桌”上，不仅有居中的《规则书》，左侧还摊开着作为索引的“目录卷轴”，右侧散落着辅助阅读的“笔记卡片”和“大纲便签”。

这种拟物化设计旨在：
1.  **增强沉浸感**：用户仿佛置身于游戏世界中阅读古籍。
2.  **利用屏幕空间**：将原本折叠的层级结构（目录）和上下文信息（相关词条）平铺展示，减少跳转和点击。
3.  **保持书本比例**：书本本体保持黄金比例，不因屏幕变宽而变形。

---

## 2. 布局策略 (Layout Strategy)

采用 CSS Grid 实现三栏布局，根据屏幕宽度动态调整。

### 2.1 响应式断点
*   **普通模式 (< 1600px)**:
    *   布局：单栏居中（书本）。
    *   目录：隐藏在左侧抽屉（Drawer）。
    *   右侧辅助：无，或隐藏。
    *   *现有逻辑保持不变。*

*   **增强模式 (>= 1600px)**:
    *   布局：三栏 Grid 布局。
    *   **左栏 (Left Column)**：目录卷轴区，固定宽度 (约 300px-350px)。
    *   **中栏 (Center Column)**：书本区，弹性宽度 (minmax(800px, 1200px))，居中对齐。
    *   **右栏 (Right Column)**：辅助卡片区，剩余空间 (minmax(300px, 1fr))。

### 2.2 Grid 结构示意
```css
.rulebook-container {
  display: grid;
  /* 左侧固定，中间自适应书本，右侧自适应卡片 */
  grid-template-columns: 320px minmax(auto, 1200px) minmax(300px, 1fr);
  gap: 2rem;
  height: 100vh;
  padding: 0 2rem;
  align-items: center; /* 垂直居中所有元素 */
}
```

---

## 3. 组件复用与改造

### 3.1 左侧：目录卷轴 (Catalog Scroll)
我们将复用现有的 `<CatalogTree>` 组件，但移除其用于 Drawer 的深色背景容器，改为“展开的卷轴”样式。

*   **视觉风格**：
    *   背景：淡黄色的羊皮纸纹理，边缘可能有磨损效果。
    *   形状：上下可能有仿佛卷轴轴杆的装饰元素。
    *   交互：常驻显示，不再自动收起。
*   **技术实现**：
    *   新建容器组件 `<CatalogScrollContainer>` 包装 `<CatalogTree>`。
    *   通过 Props 传递样式模式（例如 `theme="transparent"`）。

### 3.2 右侧：辅助桌面 (Auxiliary Desk)
右侧区域模拟“散落在桌上的笔记”。

*   **大纲便签 (TOC Note)**:
    *   功能：解析当前 Markdown 内容的 H1/H2 标题，生成页内导航。
    *   视觉：一张竖长条的泛黄纸条，像书签一样。
*   **词条卡片 (Entity Cards)**:
    *   功能：根据当前章节 `relatedEntities` 数据，展示关联的怪物、法术、物品简略信息。
    *   视觉：类似于 D&D 怪物图鉴卡或魔法物品卡片，堆叠或垂直排列。
    *   交互：点击可弹出详情模态框或跳转。

### 3.3 中间：书本 (The Book)
保持现有 `<div class="book-container">` 结构不变。
*   **微调**：
    *   移除或隐藏左上角的“红丝带目录开关”（因为目录已常驻左侧）。
    *   阴影优化：增加更深的投影，使其看起来“浮”在桌面上。

---

## 4. 交互与过渡 (Interaction & Transition)

### 4.1 模式切换
当用户调整浏览器宽度跨越 1600px 时：
*   **进入增强模式**：
    *   左侧目录从屏幕外平滑滑入，或淡入固定位置。
    *   右侧卡片依次淡入（Staggered Fade-in）。
    *   书本保持居中，宽度平滑过渡。
*   **退出增强模式**：
    *   左右侧栏淡出。
    *   左侧目录收起为 Drawer 状态。
    *   红丝带目录开关 重新出现。

### 4.2 优雅退化
在不支持 Grid 的旧浏览器中（虽然本项目针对现代浏览器不做过多兼容），回退到 Flex 布局或仅居中显示书本。

---

## 5. 组件开发计划

1.  **`src/components/wide-mode/DeskLayout.vue`**:
    *   作为新的宽屏布局容器。
    *   接收 `showCatalog`, `showAuxiliary` 等 Props。

2.  **`src/components/wide-mode/CatalogScroll.vue`**:
    *   左侧卷轴容器，内部复用 `CatalogTree`。

3.  **`src/components/wide-mode/AuxiliaryPanel.vue`**:
    *   右侧面板容器，包含 `TOCWidget` 和 `EntityCardStack`。

4.  **`src/utils/markdownUtils.ts`**:
    *   新增 `extractHeadings(markdown: string)` 函数，用于生成 TOC。

## 6. CSS 变量与资源需求
*   需要补充一些拟物化素材（这部分可以使用 CSS 渐变模拟，或复用现有纹理）：
    *   `--bg-scroll-paper`: 卷轴背景纹理。
    *   `--bg-note-paper`: 便签纸纹理。
    *   `--shadow-floating`: 悬浮卡片的投影。