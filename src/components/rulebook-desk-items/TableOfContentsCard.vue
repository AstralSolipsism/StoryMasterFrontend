<template>
  <div 
    class="toc-card relative bg-amber-50 shadow-lg rounded-sm overflow-hidden"
    :style="{ transform: `rotate(${rotation}deg)` }"
  >
    <!-- 便签纸纹理背景 -->
    <div 
      class="absolute inset-0 opacity-30 pointer-events-none"
      style="background-image: url('@/assets/images/parchment-color.png'); background-size:200px;"></div>
    
    <!-- 便签顶部装饰条 - 模拟胶带效果 -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-amber-200/60 -translate-y-1shadow-sm"></div>
    
    <!-- 内容区域 -->
    <div class="relative z-10 p-4 pt-6">
      <!-- 标题 -->
      <h3 class="text-sm font-handwriting text-stone-700 border-b border-stone-300/50 pb-2mb-3tracking-wide">
        {{ title }}
      </h3>
      
      <!-- 目录列表 -->
      <ul class="space-y-1.5">
        <li 
          v-for="(item, index) in headings" 
          :key="index"
          class="flex items-start gap-2 cursor-pointer hover:bg-amber-100/50 rounded px-1py-0.5 transition-colors group"
          @click="handleClick(item)"
        >
          <!-- 层级缩进标记 -->
          <span 
            class="text-stone-400 text-xs mt-0.5 flex-shrink-0 font-handwriting"
            :style="{ marginLeft: `${(item.level - 1) * 12}px` }"
          >
            {{ item.level === 1 ? '◆' : '•' }}
          </span>
          
          <!-- 标题文本 -->
          <span 
            class="text-stone-600 text-sm font-handwriting leading-tight group-hover:text-amber-800 transition-colors"
            :class="{ 
              'font-semibold text-stone-700': item.level === 1,
              'text-stone-500': item.level > 1
            }"
          >
            {{ item.text }}
          </span>
        </li>
      </ul>
      
      <!-- 空状态 -->
      <div
        v-if="headings.length === 0" 
        class="text-stone-400 text-xs italic font-handwriting py-4 text-center"
      >
        暂无章节大纲
      </div>
    </div>
    
    <!-- 底部阴影效果 - 模拟纸张堆叠 -->
    <div class="absolute -bottom-0.5 left-1right-1 h-1 bg-amber-100/80 rounded-b -z-10"></div><div class="absolute -bottom-1 left-2 right-2 h-1 bg-amber-100/60 rounded-b -z-20"></div>
  </div>
</template>

<script setup lang="ts">
/**
 * 目录项接口
 */
export interface TocHeading {
  /** 标题层级 (1=H1, 2=H2, 等) */
  level: number;
  /** 标题文本 */
  text: string;/** 标题对应的锚点ID（可选） */
  id?: string;
}

const props = withDefaults(defineProps<{
  /** 便签标题 */
  title?: string;
  /** 目录标题列表 */
  headings: TocHeading[];
  /** 卡片旋转角度（用于模拟自然散落效果） */
  rotation?: number;
}>(), {
  title: '章节大纲',
  rotation: 0
});

const emit = defineEmits<{
  /** 点击目录项时触发 */
  (e: 'select', heading: TocHeading): void;
}>();

/**
 * 处理目录项点击
 */
const handleClick = (item: TocHeading) => {
  emit('select', item);
};
</script>

<style scoped>
.toc-card {
  /* 便签纸颜色 - 略带泛黄 */
  background: linear-gradient(
    to bottom,
    #fef9e7 0%,
    #fdf6e3 50%,
    #fbefd5 100%
  );
  /*纸张阴影 */
  box-shadow: 
    2px 3px 8px rgba(0, 0, 0, 0.15),
    1px 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 0 30px rgba(139, 69, 19, 0.03);
  /* 纸张边缘微微不规则 */
  border: 1px solid rgba(139, 90, 43, 0.15);
}

/* 手写字体样式 */
.font-handwriting {
  font-family: 'Courier New', 'SimSun', 'KaiTi', serif;
  letter-spacing: 0.02em;
}

/* 模拟便签纸的轻微褶皱效果 */
.toc-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 24px,
    rgba(139, 90, 43, 0.05) 24px,
    rgba(139, 90, 43, 0.05) 25px
  );
  pointer-events: none;
  z-index: 5;
}
</style>