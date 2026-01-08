<template>
  <div class="catalog-tree text-stone-300">
    <div v-for="node in nodes" :key="node.id">
      <div
        class="node-label flex items-center cursor-pointer py-1 px-2 hover:bg-white/10 hover:text-stone-100 !rounded-sm transition-all duration-200 mb-1 glass-panel-sm glass-panel-dark !shadow-none"
        :class="{
          'text-amber-400 font-bold !bg-white/10 !border-amber-500/30': activeId === node.id,
          'text-stone-200 font-semibold': node.children &&  depth === 0
        }"
        :style="{ paddingLeft: `${depth * 16 + 8}px` }"
        @click.stop="handleNodeClick(node)"
      >
        <span v-if="node.children && node.children.length > 0" class="mr-2 text-[10px] text-stone-500 w-4 h-4 flex items-center justify-center">
            <template v-if="isExpanded(node)">▼</template>
            <template v-else>▶</template>
        </span>
        <span v-else class="w-4 h-4 mr-2"></span>
        <span class="truncate">{{ node.title }}</span>
      </div>
      
      <!-- Recursive rendering -->
      <div v-if="node.children && isExpanded(node)" class="node-children">
        <CatalogTree 
          :nodes="node.children" 
          :activeId="activeId" 
          :depth="depth + 1"
          @select="$emit('select', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { BookNode } from '../services/mockData';

const props = withDefaults(defineProps<{
  nodes: BookNode[];
  activeId: string;
  depth?: number;
}>(), {
  depth: 0
});

const emit = defineEmits<{
  (e: 'select', id: string): void;
}>();

const expandedNodes = ref<Set<string>>(new Set());

const isExpanded = (node: BookNode) => {
    // 默认顶级节点展开
    if (props.depth === 0 && !expandedNodes.value.has(node.id) && !closedNodes.value.has(node.id)) {
        return true;
    }
    return expandedNodes.value.has(node.id);
};

// 用来记录显式关闭的节点，以处理默认展开逻辑
const closedNodes = ref<Set<string>>(new Set());

const handleNodeClick = (node: BookNode) => {
  if (node.children && node.children.length > 0) {
    if (isExpanded(node)) {
        expandedNodes.value.delete(node.id);
        if (props.depth === 0) closedNodes.value.add(node.id); // 记录关闭
    } else {
        expandedNodes.value.add(node.id);
        closedNodes.value.delete(node.id); // 移除关闭记录
    }
  } else {
    emit('select', node.id);
  }
};

// 如果选中的节点在深层，确保父级展开
// 这部分逻辑可能需要父组件配合或更复杂的递归查找，这里暂且简化交互：点击只会展开/收起或选中
</script>

<style scoped>
/* Optional styling details */
</style>