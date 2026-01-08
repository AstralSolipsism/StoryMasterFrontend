<template>
  <div
    class="entity-card glass-panel-sm glass-hover relative overflow-hidden cursor-pointer transition-all duration-300"
    :style="{ transform: `rotate(${rotation}deg)` }":class="[typeClasses]"
    @click="handleClick"
  >
    <!-- 卡片边框装饰 -->
    <div class="absolute inset-0 border-2 rounded-xl pointer-events-none" :class="borderColorClass"></div>
    
    <!-- 卡片背景纹理 -->
    <div
      class="absolute inset-0 opacity-20 pointer-events-none"
      style="background-image: none;"
    ></div>
    
    <!-- 顶部类型标签 -->
    <div 
      class="absolute top-0 left-0 right-0 h-6 flex items-center justify-center text-xs font-bold uppercase tracking-wider"
      :class="headerColorClass"
    ><span class="relative z-10">{{ typeLabel }}</span>
    </div>
    
    <!-- 内容区域 -->
    <div class="relative z-10 pt-8 pb-4 px-3">
      <!-- 图标/插图区域 -->
      <div 
        class="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl shadow-inner"
        :class="iconBgClass"
      >
        {{ typeIcon }}
      </div>
      
      <!-- 实体名称 -->
      <h4 class="text-center font-cinzel font-bold text-stone-800 text-sm leading-tight mb-2 px-1">
        {{ entity.name }}
      </h4>
      
      <!-- 简短描述 -->
      <p class="text-xs text-stone-600 leading-relaxed line-clamp-3 text-center italic">
        {{ truncatedDescription }}
      </p>
      
      <!-- 关联标签 -->
      <div v-if="entity.relations && entity.relations.length > 0" class="mt-2 flex flex-wrap justify-center gap-1">
        <span
          v-for="(rel, index) in displayedRelations" 
          :key="index"
          class="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200/60 text-stone-500"
        >
          {{ rel.type }}
        </span>
      </div>
    </div>
    
    <!-- 底部装饰线 -->
    <div class="absolute bottom-2 left-3 right-3 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent"></div>
    
    <!-- 卡片角落装饰 -->
    <div class="absolute top-1 left-1 w-2 h-2 border-l border-t" :class="cornerBorderClass"></div>
    <div class="absolute top-1 right-1 w-2 h-2 border-r border-t" :class="cornerBorderClass"></div>
    <div class="absolute bottom-1 left-1 w-2 h-2 border-l border-b" :class="cornerBorderClass"></div>
    <div class="absolute bottom-1 right-1 w-2 h-2 border-r border-b" :class="cornerBorderClass"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Entity } from '../../services/mockData';

const props = withDefaults(defineProps<{
  /** 实体数据 */
  entity: Entity;
  /** 卡片旋转角度（用于模拟自然散落效果） */
  rotation?: number;
}>(), {
  rotation: 0
});

const emit = defineEmits<{
  /** 点击卡片时触发 */
  (e: 'click', entity: Entity): void;
}>();

/**
 * 截断的描述文本
 */
const truncatedDescription = computed(() => {
  const maxLength = 80;
  if (props.entity.description.length <= maxLength) {
    return props.entity.description;
  }
  return props.entity.description.substring(0, maxLength) + '...';
});

/**
 * 只显示前两个关联
 */
const displayedRelations = computed(() => {
  return props.entity.relations?.slice(0, 2) || [];
});

/**
 * 根据实体类型返回对应的图标
 */
const typeIcon = computed(() => {
  const icons: Record<string, string> = {
    'Spell': '✨',
    'Monster': '👹',
    'Item': '⚔️',
    'Rule': '📜',
    'Location': '🏰',
    'Character': '👤',
    'Task': '📋'
  };
  return icons[props.entity.type] || '📄';
});

/**
 * 根据实体类型返回对应的中文标签
 */
const typeLabel = computed(() => {
  const labels: Record<string, string> = {
    'Spell': '法术',
    'Monster': '怪物',
    'Item': '物品',
    'Rule': '规则',
    'Location': '地点',
    'Character': '角色',
    'Task': '任务'
  };
  return labels[props.entity.type] || '词条';
});

/**
 * 根据类型返回整体样式类
 */
const typeClasses = computed(() => '');

/**
 * 边框颜色类
 */
const borderColorClass = computed(() => {
  const colors: Record<string, string> = {
    'Spell': 'border-indigo-300/50',
    'Monster': 'border-red-300/50',
    'Item': 'border-amber-400/50',
    'Rule': 'border-stone-300/50',
    'Location': 'border-green-300/50',
    'Character': 'border-blue-300/50',
    'Task': 'border-orange-300/50'
  };
  return colors[props.entity.type] || 'border-gray-300/50';
});

/**
 * 头部颜色类
 */
const headerColorClass = computed(() => {
  const colors: Record<string, string> = {
    'Spell': 'bg-indigo-200/80text-indigo-800',
    'Monster': 'bg-red-200/80 text-red-800',
    'Item': 'bg-amber-200/80 text-amber-800',
    'Rule': 'bg-stone-200/80 text-stone-700',
    'Location': 'bg-green-200/80 text-green-800',
    'Character': 'bg-blue-200/80 text-blue-800',
    'Task': 'bg-orange-200/80 text-orange-800'
  };
  return colors[props.entity.type] || 'bg-gray-200/80 text-gray-700';
});

/**
 * 图标背景类
 */
const iconBgClass = computed(() => {
  const colors: Record<string, string> = {
    'Spell': 'bg-indigo-100',
    'Monster': 'bg-red-100',
    'Item': 'bg-amber-100',
    'Rule': 'bg-stone-100',
    'Location': 'bg-green-100',
    'Character': 'bg-blue-100',
    'Task': 'bg-orange-100'
  };
  return colors[props.entity.type] || 'bg-gray-100';
});

/**
 * 角落边框颜色类
 */
const cornerBorderClass = computed(() => {
  const colors: Record<string, string> = {
    'Spell': 'border-indigo-400/40',
    'Monster': 'border-red-400/40',
    'Item': 'border-amber-500/40',
    'Rule': 'border-stone-400/40',
    'Location': 'border-green-400/40',
    'Character': 'border-blue-400/40',
    'Task': 'border-orange-400/40'
  };
  return colors[props.entity.type] || 'border-gray-400/40';
});

/**
 * 处理卡片点击
 */
const handleClick = () => {
  emit('click', props.entity);
};
</script>

<style scoped>
.entity-card {
  /* 卡片尺寸 */
  width: 140px;
  min-height: 180px;
}

/* 文本截断 */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Cinzel 字体 */
.font-cinzel {
  font-family: 'Cinzel', serif;
}
</style>