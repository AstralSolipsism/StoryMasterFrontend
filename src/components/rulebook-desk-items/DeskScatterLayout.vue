<template>
  <div class="desk-scatter-layout relative h-full">
    <!-- 木纹桌面背景纹理（可选，增强沉浸感） -->
    <div class="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-br from-amber-900/20 to-stone-800/10"></div>
    
    <!-- 散落布局容器 -->
    <div class="scatter-container relative z-10 p-4 h-full overflow-y-auto custom-scrollbar">
      <!-- 大纲便签区域 -->
      <div v-if="showToc && headings.length > 0" class="mb-6">
        <TableOfContentsCard
          :title="tocTitle"
          :headings="headings"
          :rotation="getRandomRotation('toc')"
          @select="handleTocSelect"
        />
      </div>
      
      <!-- 词条卡片网格 -->
      <div 
        v-if="entities.length > 0"
        class="entity-cards-grid grid gap-4"
        :style="gridStyle"
      >
        <EntityReferenceCard
          v-for="(entity, index) in entities"
          :key="entity.id"
          :entity="entity"
          :rotation="getRandomRotation(`entity-${index}`)"
          class="scatter-item"
          :style="getItemStyle(index)"
          @click="handleEntityClick"
        />
      </div>
      
      <!-- 空状态 -->
      <div
        v-if="!showToc && entities.length === 0"
        class="flex flex-col items-center justify-center h-full text-stone-400"
      >
        <span class="text-4xl mb-4 opacity-50">📚</span>
        <p class="text-sm italic font-handwriting">书桌上暂无笔记</p>
      </div>
    </div></div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import TableOfContentsCard from './TableOfContentsCard.vue';
import EntityReferenceCard from './EntityReferenceCard.vue';
import type { TocHeading } from './TableOfContentsCard.vue';
import type { Entity } from '../../services/mockData';

const props = withDefaults(defineProps<{
  /** 是否显示目录大纲 */
  showToc?: boolean;
  /** 大纲标题 */
  tocTitle?: string;
  /** 目录标题列表 */
  headings?: TocHeading[];
  /** 关联实体列表 */
  entities?: Entity[];
  /** 网格列数 */
  columns?: number;
  /** 是否启用随机旋转 */
  enableRotation?: boolean;
  /** 最大旋转角度（度） */
  maxRotation?: number;
}>(), {
  showToc: true,
  tocTitle: '章节大纲',
  headings: () => [],
  entities: () => [],
  columns: 2,
  enableRotation: true,
  maxRotation: 3
});

const emit = defineEmits<{
  /** 点击目录项时触发 */
  (e: 'toc-select', heading: TocHeading): void;
  /** 点击词条卡片时触发 */
  (e: 'entity-click', entity: Entity): void;
}>();

/**
 * 存储每个元素的随机旋转角度，确保渲染一致性
 */
const rotationCache = ref<Map<string, number>>(new Map());

/**
 * 获取指定键的随机旋转角度
 *使用缓存确保同一元素在重新渲染时保持相同角度
 */
const getRandomRotation = (key: string): number => {
  if (!props.enableRotation) {
    return 0;
  }
  
  if (!rotationCache.value.has(key)) {
    // 生成 -maxRotation 到 +maxRotation 之间的随机角度
    const rotation = (Math.random() - 0.5) *2 * props.maxRotation;
    rotationCache.value.set(key, rotation);
  }
  
  return rotationCache.value.get(key) || 0;
};

/**
 * 网格样式
 */
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, minmax(0, 1fr))`
}));

/**
 * 为每个卡片生成轻微的偏移，增加自然感
 */
const getItemStyle = (index: number) => {
  if (!props.enableRotation) {
    return {};
  }
  
  // 基于索引生成伪随机偏移
  const seed = index * 7919; // 使用质数作为种子
  const offsetX = ((seed % 17) - 8) * 0.5; // -4px到 4px
  const offsetY = ((seed % 13) - 6) * 0.5; // -3px 到 3px
  
  return {
    transform: `translate(${offsetX}px, ${offsetY}px)`,
    transition: 'transform 0.3s ease'
  };
};

/**
 * 处理目录选择事件
 */
const handleTocSelect = (heading: TocHeading) => {
  emit('toc-select', heading);
};

/**
 * 处理词条点击事件
 */
const handleEntityClick = (entity: Entity) => {
  emit('entity-click', entity);
};

/**
 * 组件挂载时初始化旋转缓存
 */
onMounted(() => {
  // 预生成所有旋转角度
  if (props.enableRotation) {
    getRandomRotation('toc');
    props.entities.forEach((_, index) => {
      getRandomRotation(`entity-${index}`);
    });
  }
});
</script>

<style scoped>
.desk-scatter-layout {
  /* 整体容器样式 */
  background: transparent;
}

.scatter-container {
  /* 内容区域样式 */
}

.entity-cards-grid {
  /* 网格布局 */
}

/*卡片进入动画 */
.scatter-item {
  animation: scatter-in 0.4s ease-out backwards;
}

.scatter-item:nth-child(1) { animation-delay: 0.1s; }
.scatter-item:nth-child(2) { animation-delay: 0.15s; }
.scatter-item:nth-child(3) { animation-delay: 0.2s; }
.scatter-item:nth-child(4) { animation-delay: 0.25s; }
.scatter-item:nth-child(5) { animation-delay: 0.3s; }
.scatter-item:nth-child(6) { animation-delay: 0.35s; }

@keyframes scatter-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 自定义滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(139, 69, 19, 0.2);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(139, 69, 19, 0.4);
}

/* 手写字体 */
.font-handwriting {
  font-family: 'Courier New', 'SimSun', 'KaiTi', serif;
}
</style>