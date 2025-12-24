/**
 * 规则书桌面物品组件
 *
 * 这些组件用于"功能增强模式"的辅助区域，模拟冒险家书桌上散落的笔记和卡片。
 *
 * 组件列表：
 * - TableOfContentsCard: 大纲便签组件，模拟手写便签纸展示章节大纲
 * - EntityReferenceCard: 词条卡片组件，模拟D&D图鉴卡片展示关联词条
 * - DeskScatterLayout: 布局容器组件，使用Grid布局并添加随机旋转效果
 * - ScrollableCatalogWrapper: 卷轴目录组件，用于左侧常驻目录，模拟古老卷轴样式
 */

export { default as TableOfContentsCard } from './TableOfContentsCard.vue';
export { default as EntityReferenceCard } from './EntityReferenceCard.vue';
export { default as DeskScatterLayout } from './DeskScatterLayout.vue';
export { default as ScrollableCatalogWrapper } from './ScrollableCatalogWrapper.vue';

// 类型导出
export type { TocHeading } from './TableOfContentsCard.vue';