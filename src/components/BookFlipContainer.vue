<template>
  <div class="book-flip-container" :class="{ flipping: isFlipping }">
    <!-- Left page -->
    <BookPage
      class="page-slot left-slot"
      side="left"
      :content="leftContent"
      :pageNumber="leftNumber"
    />

    <!-- Right page (static) -->
    <BookPage
      v-if="showRightStatic"
      class="page-slot right-slot"
      side="right"
      :content="rightContent"
      :pageNumber="rightNumber"
    />

    <!-- Underlay pages used during flips -->
    <BookPage
      v-if="showUnderlayRight"
      class="page-slot right-slot underlay"
      side="right"
      :content="underlayRightContent"
      :pageNumber="underlayRightNumber"
    />

    <!-- Flipping leaf -->
    <FlippingPage
      v-if="isFlipping && flipDirection"
      :direction="flipDirection"
      :progress="flipProgress"
      :content="flipFrontContent"
      :backContent="flipBackContent"
    />

    <!-- Center spine line (visual) -->
    <div class="book-spine" aria-hidden="true"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BookPage from './BookPage.vue';
import FlippingPage from './FlippingPage.vue';
import type { PageContent } from '../utils/pagePaginator';

const props = defineProps<{
  pages: PageContent[];
  currentSpread: number;
  isFlipping: boolean;
  flipDirection: 'next' | 'prev' | null;
  flipProgress: number;
}>();

const leftIndex = computed(() => props.currentSpread * 2);
const rightIndex = computed(() => leftIndex.value + 1);
const nextLeftIndex = computed(() => leftIndex.value + 2);
const nextRightIndex = computed(() => leftIndex.value + 3);
const prevLeftIndex = computed(() => leftIndex.value - 2);
const prevRightIndex = computed(() => leftIndex.value - 1);

const getContent = (idx: number) => props.pages[idx]?.content ?? '';
const getNumber = (idx: number) => props.pages[idx]?.pageNumber ?? 0;

const leftContent = computed(() => {
  // During a "prev" flip the current left leaf is turning; show the underlay.
  if (props.isFlipping && props.flipDirection === 'prev') return getContent(prevLeftIndex.value);
  return getContent(leftIndex.value);
});

const leftNumber = computed(() => {
  if (props.isFlipping && props.flipDirection === 'prev') return getNumber(prevLeftIndex.value);
  return getNumber(leftIndex.value);
});

const rightContent = computed(() => getContent(rightIndex.value));
const rightNumber = computed(() => getNumber(rightIndex.value));

const showRightStatic = computed(() => {
  // When flipping next, the right page becomes the turning leaf.
  return !(props.isFlipping && props.flipDirection === 'next');
});

const showUnderlayRight = computed(() => props.isFlipping && props.flipDirection === 'next');
const underlayRightContent = computed(() => getContent(nextRightIndex.value));
const underlayRightNumber = computed(() => getNumber(nextRightIndex.value));

const flipFrontContent = computed(() => {
  if (props.flipDirection === 'next') return getContent(rightIndex.value);
  return getContent(leftIndex.value);
});

const flipBackContent = computed(() => {
  if (props.flipDirection === 'next') return getContent(nextLeftIndex.value);
  return getContent(prevRightIndex.value);
});
</script>

<style scoped>
.book-flip-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  perspective: 2000px;
  transform-style: preserve-3d;
}

.page-slot {
  width: 50%;
  height: 100%;
  position: relative;
  z-index: 10;
}

.left-slot {
  border-right: 1px solid rgba(139, 69, 19, 0.16);
}

.right-slot {
  border-left: 1px solid rgba(139, 69, 19, 0.08);
}

.underlay {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 5;
}

.underlay.right-slot {
  right: 0;
}

.book-spine {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  margin-left: -1px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(139, 69, 19, 0.22) 10%,
    rgba(139, 69, 19, 0.42) 50%,
    rgba(139, 69, 19, 0.22) 90%,
    transparent
  );
  z-index: 80;
  pointer-events: none;
}
</style>
