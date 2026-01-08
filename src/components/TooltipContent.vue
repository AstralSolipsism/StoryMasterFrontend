<template>
  <div class="tooltip-wrapper text-left text-sm text-stone-200">
    <div v-if="loading" class="p-3 text-center text-stone-400 italic flex items-center justify-center gap-2 glass-panel-sm glass-panel-dark">
      <span class="animate-pulse">🔮</span> Reading Grimoire...
    </div>
    <div v-else-if="entity" class="glass-panel-sm glass-panel-dark overflow-hidden max-w-sm">
      <!-- Header -->
      <div class="glass-panel-sm glass-panel-dark !shadow-none !rounded-none !border-x-0 !border-t-0 p-2 px-3 flex justify-between items-baseline">
        <h4 class="font-bold text-amber-500 font-serif tracking-wide">{{ entity.name }}</h4>
        <span class="text-[0.65rem] uppercase tracking-widest text-stone-500 ml-2 border border-stone-700 px-1 rounded">{{ entity.type }}</span>
      </div>
      
      <!-- Body -->
      <div class="p-3 max-h-64 overflow-y-auto custom-scrollbar text-stone-300 leading-relaxed group-hover:text-stone-100 transition-colors">
        <!-- Recursive usage of MarkdownRenderer to allow nested tooltips -->
        <MarkdownRenderer :content="entity.description" class="prose-invert prose-sm" />
      </div>

      <!-- Footer: Quick Relations -->
      <div v-if="entity.relations && entity.relations.length" class="glass-panel-sm glass-panel-dark !shadow-none !rounded-none !border-x-0 !border-b-0 p-2 text-xs space-y-1">
         <div v-for="(rel, idx) in entity.relations" :key="idx" class="flex gap-2">
             <span class="text-stone-500 font-mono">{{ rel.type }}:</span>
             <span class="text-stone-400">{{ getEntityName(rel.targetId) }}</span>
         </div>
      </div>
    </div>
    <div v-else class="p-2 text-red-400 glass-panel-sm glass-panel-dark" style="--_glass-bg: rgba(127, 29, 29, 0.22); --_glass-border: rgba(127, 29, 29, 0.55);">
      Fizzled... (Unknown Entity: {{ entityId }})
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { mockEntities } from '../services/mockData';
import MarkdownRenderer from './MarkdownRenderer.vue';

const props = defineProps<{
  entityId: string;
}>();

const loading = ref(true);

onMounted(() => {
  // Simulate network/decryption delay
  setTimeout(() => {
    loading.value = false;
  }, 200); // Fast but noticeable
});

const entity = computed(() => {
  return mockEntities.value[props.entityId];
});

const getEntityName = (id: string) => {
    return mockEntities.value[id]?.name || id;
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.1);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(168, 162, 158, 0.3);
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 162, 158, 0.5);
}
</style>