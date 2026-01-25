import { computed, onBeforeUnmount, ref, type Ref, watch } from 'vue';
import type { PageContent } from '../utils/pagePaginator';

export type FlipDirection = 'next' | 'prev';

type UsePageFlipOptions = {
  durationMs?: number;
};

/**
 * Controls a 0..1 flip progress value using requestAnimationFrame.
 * The caller decides how to render the page based on direction/progress.
 */
export function usePageFlip(
  paginatedPages: Ref<PageContent[]>,
  currentSpread: Ref<number>,
  options: UsePageFlipOptions = {},
) {
  const isFlipping = ref(false);
  const flipDirection = ref<FlipDirection | null>(null);
  const flipProgress = ref(0);

  const durationMs = options.durationMs ?? 800;

  const maxSpread = computed(() => {
    const spreads = Math.ceil((paginatedPages.value?.length ?? 0) / 2);
    return Math.max(0, spreads - 1);
  });

  const canFlipNext = computed(() => !isFlipping.value && currentSpread.value < maxSpread.value);
  const canFlipPrev = computed(() => !isFlipping.value && currentSpread.value > 0);

  let rafId: number | null = null;
  let cancelled = false;

  const cancel = () => {
    cancelled = true;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    isFlipping.value = false;
    flipDirection.value = null;
    flipProgress.value = 0;
  };

  onBeforeUnmount(cancel);

  watch(
    () => paginatedPages.value,
    () => {
      // If content changes mid-animation (chapter switch), reset to avoid odd states.
      if (isFlipping.value) cancel();

      // Clamp spread into bounds.
      if (currentSpread.value > maxSpread.value) currentSpread.value = maxSpread.value;
      if (currentSpread.value < 0) currentSpread.value = 0;
    },
    { deep: false },
  );

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const animateFlip = (start: number, end: number, ms: number): Promise<void> => {
    cancelled = false;
    if (rafId !== null) cancelAnimationFrame(rafId);

    return new Promise((resolve) => {
      const startTime = performance.now();

      const step = (now: number) => {
        if (cancelled) return resolve();
        const elapsed = now - startTime;
        const t = Math.min(elapsed / ms, 1);
        flipProgress.value = start + (end - start) * easeInOutCubic(t);

        if (t < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          rafId = null;
          resolve();
        }
      };

      rafId = requestAnimationFrame(step);
    });
  };

  const flipNext = async (): Promise<boolean> => {
    if (!canFlipNext.value) return false;

    isFlipping.value = true;
    flipDirection.value = 'next';
    await animateFlip(0, 1, durationMs);

    // If we got cancelled mid-flight, do not mutate spread.
    if (!cancelled) currentSpread.value = Math.min(currentSpread.value + 1, maxSpread.value);

    isFlipping.value = false;
    flipDirection.value = null;
    flipProgress.value = 0;
    return true;
  };

  const flipPrev = async (): Promise<boolean> => {
    if (!canFlipPrev.value) return false;

    isFlipping.value = true;
    flipDirection.value = 'prev';
    await animateFlip(0, 1, durationMs);

    if (!cancelled) currentSpread.value = Math.max(currentSpread.value - 1, 0);

    isFlipping.value = false;
    flipDirection.value = null;
    flipProgress.value = 0;
    return true;
  };

  return {
    isFlipping,
    flipDirection,
    flipProgress,
    maxSpread,
    canFlipNext,
    canFlipPrev,
    flipNext,
    flipPrev,
    cancel,
  };
}

