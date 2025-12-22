<template>
  <div
    v-html="renderedContent"
    @click="handleClick"
    class="prose prose-stone max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-ink-black"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import { mockEntities } from '../services/mockData';

const props = defineProps<{
  content: string;
}>();

const emit = defineEmits<{
  (e: 'entity-click', entityId: string): void;
}>();

const md = new MarkdownIt({
  html: true,
  breaks: true,
  typographer: true
});

const renderedContent = computed(() => {
  if (!props.content) return '';

  // Basic markdown rendering
  let html = md.render(props.content);

  // Replace [Entity] patterns with clickable spans
  // Supports patterns like: [Entity Name] or [Entity Name (Alias)] or [Display Text](EntityID) technically though regex here focuses on brackets
  // The original simple regex was /\[(.*?)\]/g
  // Improved to handle localized names better and be more robust
  html = html.replace(/\[(.*?)\]/g, (match: string, p1: string) => {
    const rawText = p1.trim();
    
    // Check if p1 matches an entity ID or Name
    // Strategy:
    // 1. Exact match ID
    // 2. Exact match Name
    // 3. Name contains text (for loose matching like "Fireball" matching "Fireball (Spell)")
    
    const entityId = Object.keys(mockEntities.value).find(key => {
        const entity = mockEntities.value[key];
        if (!entity) return false;

        const name = entity.name.toLowerCase();
        const search = rawText.toLowerCase();
        
        return key === search || name === search || name.includes(search) || search.includes(name);
    });

    if (entityId) {
      return `<span class="entity-link text-ink-red font-bold cursor-pointer hover:underline decoration-wavy bg-ink-red/5 px-1 rounded transition-colors" data-entity-id="${entityId}">${p1}</span>`;
    }
    return match;
  });

  return html;
});

const handleClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.classList.contains('entity-link')) {
    const entityId = target.getAttribute('data-entity-id');
    if (entityId) {
      emit('entity-click', entityId);
    }
  }
};
</script>
