<template>
  <Teleport to="body">
    <Transition name="slide-fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div class="fixed inset-0 transition-opacity glass-panel-sm glass-panel-dark !rounded-none !border-0 !shadow-none" style="--_glass-bg: var(--bg-overlay);" @click="$emit('close')"></div>

        <!-- Panel -->
        <div class="relative w-full max-w-md h-full glass-panel-md !rounded-none flex flex-col transform transition-transform" style="border-left: 4px solid var(--color-ink-red);">
          
          <!-- Close Button -->
          <button @click="$emit('close')" class="absolute top-4 right-4 text-stone-500 hover:text-ink-red transition-colors focus:outline-none z-10">
            <span class="sr-only">{{ t('common.close') }}</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Header -->
          <div class="pt-12 px-6 pb-4 glass-panel-sm !shadow-none !rounded-none !border-x-0 !border-t-0">
            <h2 class="text-2xl font-serif font-bold text-ink-black tracking-wide">{{ title }}</h2>
            <div v-if="subtitle" class="text-sm font-bold uppercase text-stone-500 mt-1 tracking-widest">{{ subtitle }}</div>
          </div>

          <!-- Content -->
          <div class="flex-grow overflow-y-auto px-6 py-6 custom-scrollbar">
             <MarkdownRenderer v-if="content" :content="content" />
             <slot v-else></slot>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import MarkdownRenderer from '../MarkdownRenderer.vue'

export default defineComponent({
  name: 'DetailSlideOver',
  components: {
    MarkdownRenderer
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
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
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active .relative, 
.slide-fade-leave-active .relative {
  transition: transform 0.3s ease-out;
}

.slide-fade-enter-from .relative,
.slide-fade-leave-to .relative {
  transform: translateX(100%);
}

.paper-texture {
  background-image: none;
}
</style>