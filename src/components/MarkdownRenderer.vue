<template>
  <div
    ref="containerRef"
    v-html="renderedContent"
    class="prose prose-stone max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-ink-black book-content"
  ></div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUpdated, onBeforeUnmount, ref, createApp } from 'vue';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import tippy, { type Instance } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { mockEntities } from '../services/mockData';
import TooltipContent from './TooltipContent.vue';

const props = defineProps<{
  content: string;
}>();

const containerRef = ref<HTMLElement | null>(null);
let tippyInstances: Instance[] = [];

/**
 * 为标题生成稳定锚点（用于右侧 TOC 跳转）
 * - 允许中文字符进入 slug
 */
const slugify = (s: string) => s.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');

const md = new MarkdownIt({
  html: true,
  breaks: true,
  typographer: true,
}).use(anchor, {
  permalink: false,
  slugify,
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

const attachTooltips = () => {
  if (!containerRef.value) return;

  // Cleanup old instances
  tippyInstances.forEach(t => t.destroy());
  tippyInstances = [];

  const elements = containerRef.value.querySelectorAll('.entity-link[data-entity-id]');
  
  elements.forEach((el) => {
    const entityId = el.getAttribute('data-entity-id');
    if (!entityId) return;

    // Create a container for the Vue application
    const container = document.createElement('div');
    container.className = 'tippy-vue-container';

    const instance = tippy(el, {
      content: container,
      interactive: true,
      trigger: 'mouseenter click', // Support click for mobile
      appendTo: document.body,
      theme: 'light', // As requested, though contents are dark styled
      maxWidth: 'none',
      animation: 'shift-away',
      placement: 'auto',
      delay: [100, 200], // Slight delay to prevent flickering
      onShow(instance) {
        // Lazy load the Vue component
        if (! (instance as any)._vueApp) {
           const app = createApp(TooltipContent, { entityId });
           app.mount(container);
           (instance as any)._vueApp = app;
        }
      },
      onHidden(instance) {
         // Destroy app to free memory and ensure fresh state next time
         const app = (instance as any)._vueApp;
         if (app) {
           app.unmount();
           (instance as any)._vueApp = null;
           container.innerHTML = '';
         }
      }
    });

    tippyInstances.push(instance as Instance);
  });
};

onMounted(attachTooltips);
onUpdated(attachTooltips);

onBeforeUnmount(() => {
  tippyInstances.forEach(t => t.destroy());
  tippyInstances = [];
});
</script>

<style scoped>
/* Book Styling for Markdown Content */
:deep(.book-content) {
  text-align: justify;
  font-size: 1.05rem; /* Readability */
}

@media (max-width: 768px) {
  :deep(.book-content) {
    font-size: 1rem; /* Slightly smaller on mobile but still readable */
    line-height: 1.5;
  }
}

:deep(h1), :deep(h2) {
  column-span: all; /* Title spans both columns */
  color: var(--color-ink-red);
  font-family: 'Cinzel', serif;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(139, 69, 19, 0.2);
  padding-bottom: 0.25rem;
  line-height: 1.2;
}

:deep(h3), :deep(h4) {
  break-after: avoid; /* Keep heading with content */
  color: #4a3728;
  font-family: var(--font-serif);
  font-weight: bold;
  margin-top: 1.2em;
  margin-bottom: 0.5em;
}

:deep(p) {
  margin-bottom: 0;
  margin-top: 0;
  line-height: 1.6;
  text-indent: 1.5em; /* Classic book paragraph indent */
}

/* First paragraph after heading should not indent */
:deep(h1 + p),
:deep(h2 + p),
:deep(h3 + p),
:deep(h4 + p) {
  text-indent: 0;
}

/* Spacing between paragraphs if desired, but indent style usually has less spacing.
   Let's use a small margin for readability + indent. */
:deep(p + p) {
  margin-top: 0.5em;
}

:deep(blockquote) {
  border-left: 3px solid var(--color-ink-red);
  background-color: rgba(139, 69, 19, 0.05);
  padding: 0.5rem 1rem;
  margin: 1rem 0;
  font-style: italic;
  break-inside: avoid;
}

:deep(ul), :deep(ol) {
  break-inside: avoid;
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  list-style-position: outside;
}

:deep(li) {
  margin-bottom: 0.25rem;
}

:deep(img) {
  break-inside: avoid;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
  border-radius: 2px;
  margin: 1rem auto;
  max-width: 100%;
}

:deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  break-inside: avoid;
  font-size: 0.9em;
  border: 1px solid rgba(139, 69, 19, 0.2);
}

:deep(th) {
  background-color: rgba(139, 69, 19, 0.1);
  border-bottom: 2px solid #8b4513;
  padding: 0.5rem;
  text-align: left;
  font-family: 'Cinzel', serif;
  font-weight: bold;
  color: #3e2723;
}

:deep(td) {
  border-bottom: 1px solid rgba(139, 69, 19, 0.1);
  padding: 0.5rem;
}

:deep(tr:nth-child(even)) {
  background-color: rgba(139, 69, 19, 0.03);
}

/* Entity Links Styling */
:deep(.entity-link) {
  color: var(--color-ink-red);
  font-weight: 600;
  text-decoration-color: rgba(139, 0, 0, 0.3);
}
:deep(.entity-link:hover) {
  background-color: rgba(139, 0, 0, 0.05);
}
</style>

<style>
/* Override tippy box to match our custom content if needed */
.tippy-box[data-theme~='light'] {
  background-color: transparent;
  box-shadow: none;
  overflow: visible;
}
.tippy-box[data-theme~='light'] .tippy-content {
  padding: 0;
}
</style>
