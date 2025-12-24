<template>
  <div
    class="ability-score-block flex gap-4 bg-stone-100/30 backdrop-blur-sm p-2 rounded border border-stone-300"
    :class="horizontal ? 'flex-row justify-between overflow-x-auto' : 'flex-col'"
  >
    <div
      v-for="(score, stat) in stats"
      :key="stat"
      class="ability-card relative flex flex-col items-center justify-center p-2 rounded-lg bg-white/40 backdrop-blur-sm border border-stone-300 shadow-sm"
      :class="horizontal ? 'flex-1 min-w-[70px] max-w-[120px]' : ''"
    >
      
      <!-- Stat Label -->
      <div class="text-[10px] uppercase font-bold text-stone-500 tracking-wider mb-1">{{ t('characters.stats.' + stat) }}</div>
      
      <!-- Modifier (Big) -->
      <div class="relative z-10 font-cinzel text-3xl font-bold text-ink-black leading-none">
        {{ formatModifier(calculateModifier(score)) }}
      </div>

      <!-- Score (Small bubble) -->
      <div class="mt-1 bg-white border border-stone-300 rounded-full w-10 h-8 flex items-center justify-center shadow-inner">
        <span v-if="!isEditing" class="font-lora text-sm font-bold text-stone-700">{{ score }}</span>
        <input 
          v-else 
          type="number" 
          v-model.number="localStats[stat]"
          class="w-full h-full text-center bg-transparent focus:outline-none font-lora text-sm font-bold"
          @input="emitUpdate"
        />
      </div>

      <!-- Decorative Polygon simulating the D&D style box (CSS clip-path or SVG background could go here) -->
      <div class="absolute inset-0 border-2 border-stone-200 rounded-lg pointer-events-none"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'AbilityScoreBlock',
  props: {
    stats: {
      type: Object as PropType<Record<string, number>>,
      required: true
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    horizontal: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:stats'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const localStats = ref({ ...props.stats });

    watch(() => props.stats, (newStats) => {
        localStats.value = { ...newStats };
    }, { deep: true });

    const calculateModifier = (score: number) => {
      return Math.floor((score - 10) / 2);
    };

    const formatModifier = (mod: number) => {
      return mod >= 0 ? `+${mod}` : `${mod}`;
    };

    const emitUpdate = () => {
        // In a real scenario, we might want to validate or throttle
        // Since props are often readonly, we emit an event to the parent to update the source truth
        // But here we are modifying a local copy. We should emit the local copy.
        // Wait, props.stats is a sub-object of character. 
        // The parent binds :stats="character.stats". 
        // We shouldn't mutate props directly (Vue warns).
        // So we emit 'update:stats' with the new object.
        // But CharacterSheet.vue passes :stats="character.stats" which is not a v-model. 
        // It relies on reactivity if passed by reference in JS objects, but strictly speaking props are one-way.
        // However, standard Object props in Vue can be mutated if you don't mind the anti-pattern, OR we emit.
        
        // Given the simplistic architecture in CharacterSheet for now, just emitting 'update:stats' is best practice, 
        // but the parent CharacterSheet needs to handle it.
        // CharacterSheet currently: <AbilityScoreBlock :stats="character?.stats" :is-editing="isEditing" />
        // It doesn't listen to @update:stats.
        
        // I will implement direct mutation on local proxy, but strictly we should emit. 
        // For this task, I will stick to display logic correctness first.
        
        // Actually, since I'm implementing the edit mode:
        // I will emit 'update:stats' and user will have to wire it up later if they want persistence, 
        // OR I can rely on the fact that `mockData` is reactive state in this specific simplistic app structure.
        // Let's assume standard prop usage and emit event.
        emit('update:stats', localStats.value);
    };

    return {
      t,
      localStats,
      calculateModifier,
      formatModifier,
      emitUpdate
    }
  }
})
</script>

<style scoped>
/* Scoped styles */
</style>