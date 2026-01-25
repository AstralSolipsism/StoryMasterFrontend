<template>
  <div class="book-page" :class="[`page-${side}`]">
    <div class="page-inner">
      <MarkdownRenderer v-if="content" :content="content" />
      <div v-else class="page-blank" aria-hidden="true"></div>
    </div>

    <div v-if="pageNumber > 0" class="page-number" :class="`page-number-${side}`">
      {{ pageNumber }}
    </div>
  </div>
</template>

<script setup lang="ts">
import MarkdownRenderer from './MarkdownRenderer.vue';

defineProps<{
  content: string;
  pageNumber: number;
  side: 'left' | 'right';
}>();
</script>

<style scoped>
.book-page {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fdfbf7;
  overflow: hidden;
}

.page-inner {
  flex: 1;
  min-height: 0;
  /* Keep left/right margins consistent and tight (synced with RulebookView#getPageLayout). */
  padding: 1.375rem;
  overflow: hidden;
}

@media (max-width: 768px) {
  .page-inner {
    padding: 1.125rem;
  }
}

.page-blank {
  width: 100%;
  height: 100%;
}

/* Subtle gutter shading to sell the two-page spread. */
.page-left::after,
.page-right::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 16px;
  pointer-events: none;
  opacity: 0.35;
}

.page-left::after {
  right: 0;
  background: linear-gradient(to left, rgba(0, 0, 0, 0.08), transparent);
}

.page-right::after {
  left: 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.08), transparent);
}

.page-number {
  position: absolute;
  bottom: 0.9rem;
  font-family: var(--font-serif);
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.45);
  user-select: none;
}

.page-number-left {
  left: 1rem;
}

.page-number-right {
  right: 1rem;
}
</style>
