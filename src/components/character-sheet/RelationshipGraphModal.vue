<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8" role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>

        <!-- Modal Container -->
        <div class="relative w-full max-w-5xl h-[85vh] bg-[#fdf6e3] shadow-2xl rounded-sm flex flex-col paper-texture border-2 border-stone-400">
          
          <!-- Close Button -->
          <button @click="$emit('close')" class="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-stone-200/80 hover:bg-ink-red hover:text-white rounded-full transition-colors shadow-sm">
            <span class="sr-only">Close</span>
            <i class="fas fa-times"></i>
          </button>

          <!-- Header -->
          <div class="px-6 py-4 border-b border-stone-300 bg-stone-100/50 flex items-center justify-between">
            <h2 class="text-xl md:text-2xl font-serif font-bold text-ink-black tracking-wide flex items-center gap-2">
                <i class="fas fa-project-diagram text-ink-red"></i>
                {{ t('characters.graph.title') }}
            </h2>
            <div class="text-xs uppercase font-bold text-stone-500 tracking-widest hidden md:block">
                {{ t('characters.graph.interactive') }}
            </div>
          </div>

          <!-- Content (Graph) -->
          <div class="flex-grow relative overflow-hidden bg-[#fdf6e3]">
             <RelationshipGraph :characterId="characterId" />
          </div>
          
          <!-- Footer/Legend -->
          <div class="px-4 py-2 bg-stone-100/50 border-t border-stone-300 text-xs text-stone-500 flex gap-4 justify-center font-cinzel">
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-ink-red"></span> {{ t('characters.graph.legend.hostile') }}</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-600"></span> {{ t('characters.graph.legend.friendly') }}</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-stone-400"></span> {{ t('characters.graph.legend.neutral') }}</span>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import RelationshipGraph from './RelationshipGraph.vue'

export default defineComponent({
  name: 'RelationshipGraphModal',
  components: {
    RelationshipGraph
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    characterId: {
      type: String,
      required: true
    }
  },
  emits: ['close'],
  setup() {
    const { t } = useI18n()
    return { t }
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.paper-texture {
  background-image: url('../../assets/images/parchment-color.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-blend-mode: multiply;
}

.font-cinzel {
    font-family: 'Cinzel', serif;
}
</style>