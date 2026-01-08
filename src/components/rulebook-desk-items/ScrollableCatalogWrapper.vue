<template>
  <div class="scrollable-catalog-wrapper glass-panel-lg glass-panel-dark relative flex flex-col">
    <!--卷轴顶部装饰 - 模拟卷轴横杆 -->
    <div class="scroll-rod-top relative h-3 flex-shrink-0">
      <div class="absolute inset-x-0 h-full bg-gradient-to-b from-amber-200/20 to-amber-100/10 rounded-t-xl"></div><div class="absolute inset-x-2 top-0.5 h-1.5 bg-gradient-to-b from-amber-200/25 to-transparent rounded-full"></div>
      <!-- 卷轴两端装饰 -->
      <div class="absolute -left-1 top-0 w-4 h-3 bg-amber-950/30 rounded-full"></div>
      <div class="absolute -right-1 top-0 w-4 h-3 bg-amber-950/30 rounded-full"></div>
    </div>
    
    <!-- 卷轴内容区域 -羊皮纸背景 -->
    <div 
      ref="scrollContainer"
      class="scroll-content flex-1 overflow-y-auto overflow-x-hidden relative"
      :style="contentStyle"
    >
      <!-- 羊皮纸背景层 -->
      <div class="absolute inset-0 pointer-events-none">
        <!-- 基础颜色渐变 -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/25"></div>
        <!-- 纹理覆盖 -->
        <div
          class="absolute inset-0 opacity-5"
          style="background-image: none;"
        ></div>
        <!-- 左右边缘阴影 - 模拟卷曲效果 -->
        <div class="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/20 to-transparent"></div>
        <div class="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-black/20 to-transparent"></div>
      </div>
      
      <!-- 内容插槽 -->
      <div class="relative z-10 px-2 py-3">
        <!-- 标题区域 -->
        <div v-if="title" class="catalog-title px-2 pb-3 mb-2 border-b border-amber-600/30">
          <h3 class="text-amber-400/90 text-sm font-bold tracking-wide flex items-center gap-2">
            <span class="text-amber-500/60">📜</span>
            {{ title }}
          </h3>
        </div>
        
        <!-- CatalogTree 组件容器 -->
        <div class="catalog-tree-container">
          <slot>
            <!-- 默认使用 CatalogTree 组件 -->
            <CatalogTree 
              :nodes="nodes" 
              :activeId="activeId"
              @select="handleSelect"/>
          </slot>
        </div>
      </div>
    </div>
    
    <!-- 卷轴底部装饰 - 模拟卷轴横杆 -->
    <div class="scroll-rod-bottom relative h-3 flex-shrink-0">
      <div class="absolute inset-x-0 h-full bg-gradient-to-t from-amber-200/20 to-amber-100/10 rounded-b-xl"></div>
      <div class="absolute inset-x-2 bottom-0.5 h-1.5 bg-gradient-to-t from-amber-200/25 to-transparent rounded-full"></div>
      <!-- 卷轴两端装饰 -->
      <div class="absolute -left-1 bottom-0 w-4 h-3 bg-amber-950/30 rounded-full"></div>
      <div class="absolute -right-1 bottom-0 w-4 h-3 bg-amber-950/30 rounded-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CatalogTree from '../CatalogTree.vue';
import type { BookNode } from '../../services/mockData';

const props = withDefaults(defineProps<{
  /** 目录节点数据 */
  nodes?: BookNode[];
  /** 当前选中的节点ID */
  activeId?: string;
  /** 卷轴标题 */
  title?: string;
  /** 容器高度（支持 CSS 值，如 'calc(100vh - 120px)'） */
  height?: string;
}>(), {
  nodes: () => [],
  activeId: '',
  title: '目录',
  height: 'calc(100vh - 120px)'
});

const emit = defineEmits<{
  /** 选中目录项时触发 */
  (e: 'select', id: string): void;
}>();

/**
 * 计算内容区域样式
 */
const contentStyle = computed(() => ({
  height: props.height,
  maxHeight: props.height
}));

/**
 * 处理目录项选中
 */
const handleSelect = (id: string) => {
  emit('select', id);
};
</script>

<style scoped>
.scrollable-catalog-wrapper {
  /* 卷轴整体宽度 */
  width: 100%;
  min-width: 200px;
  max-width: 280px;
  
  /* 阴影由全局毛玻璃工具类提供 */
}

/* 自定义滚动条样式 -羊皮纸风格 */
.scroll-content {
  scrollbar-width: thin;
  scrollbar-color: rgba(180, 130, 80, 0.5) transparent;
}

.scroll-content::-webkit-scrollbar {
  width: 6px;
}

.scroll-content::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.scroll-content::-webkit-scrollbar-thumb {
  background: linear-gradient(
    to bottom,
    rgba(180, 130, 80, 0.4),
    rgba(140, 100, 60, 0.6),
    rgba(180, 130, 80, 0.4)
  );
  border-radius: 3px;border: 1px solid rgba(100, 70, 40, 0.3);
}

.scroll-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(
    to bottom,
    rgba(200, 150, 100, 0.6),
    rgba(160, 120, 80, 0.8),
    rgba(200, 150, 100, 0.6)
  );
}

/* 覆盖 CatalogTree 的背景样式，使其透明 */
.catalog-tree-container :deep(.catalog-tree) {
  background: transparent;
}

/* 调整 CatalogTree 节点的悬停样式以适配深色背景 */
.catalog-tree-container :deep(.node-label) {
  color: rgba(214, 211, 209, 0.9); /* stone-300 */
}

.catalog-tree-container :deep(.node-label:hover) {
  background: rgba(255, 255, 255, 0.08);color: rgba(245, 245, 244, 1); /* stone-100 */
}

/* 激活状态样式 */
.catalog-tree-container :deep(.node-label.text-amber-400) {
  color: rgba(251, 191, 36, 1); /* amber-400 */
  background: rgba(255, 255, 255, 0.06);
}
</style>