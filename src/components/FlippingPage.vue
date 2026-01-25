<template>
  <div class="flipping-page-wrapper" :style="wrapperStyle" aria-hidden="true">
    <div class="flipping-page" :class="{ animating: progress > 0 && progress < 1 }" :style="flipTransform">
      <div class="page-face page-front">
        <MarkdownRenderer v-if="content" :content="content" />
      </div>
      <div class="page-face page-back">
        <MarkdownRenderer v-if="backContent" :content="backContent" />
      </div>
    </div>

    <div class="flip-shadow" :style="shadowStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MarkdownRenderer from './MarkdownRenderer.vue';

const props = defineProps<{
  content: string;
  backContent: string;
  direction: 'next' | 'prev';
  progress: number; // 0..1
}>();

const wrapperStyle = computed(() => {
  return props.direction === 'next' ? { left: '50%' } : { left: '0' };
});

const flipTransform = computed(() => {
  const clamped = Math.min(Math.max(props.progress, 0), 1);
  const angle = props.direction === 'next' ? -180 * clamped : 180 * clamped;

  return {
    transform: `rotateY(${angle}deg) translateZ(2px)`,
    transformOrigin: props.direction === 'next' ? 'left center' : 'right center',
  };
});

const shadowStyle = computed(() => {
  const clamped = Math.min(Math.max(props.progress, 0), 1);
  const opacity = Math.sin(clamped * Math.PI) * 0.45;

  return {
    opacity,
    background:
      props.direction === 'next'
        ? 'linear-gradient(to right, rgba(0, 0, 0, 0.35), transparent 70%)'
        : 'linear-gradient(to left, rgba(0, 0, 0, 0.35), transparent 70%)',
  };
});
</script>

<style scoped>
.flipping-page-wrapper {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  z-index: 60;
  transform-style: preserve-3d;
  pointer-events: none;
}

.flipping-page {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  will-change: transform;
}

.flipping-page:not(.animating) {
  will-change: auto;
}

.page-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  background: #fdfbf7;
  /* Match BookPage padding so margins don't "jump" mid-flip. */
  padding: 1.375rem;
  overflow: hidden;
}

@media (max-width: 768px) {
  .page-face {
    padding: 1.125rem;
  }
}

.page-back {
  transform: rotateY(180deg);
  /* Slightly darker backface sells paper thickness. */
  background: linear-gradient(180deg, #fbf8f1, #f3efe6);
}

.flip-shadow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: multiply;
}
</style>
