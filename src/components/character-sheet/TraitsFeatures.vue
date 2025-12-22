<template>
  <div class="traits-features flex flex-col gap-6 h-full">

    <!-- Personality Traits, Ideals, Bonds, Flaws -->
    <div class="grid grid-cols-1 gap-4">
       <div v-for="(key, index) in personalityKeys" :key="key" class="border-2 border-[var(--color-border)] rounded-lg p-3 bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] shadow-sm relative group">
           <div class="text-[0.65rem] uppercase tracking-wide font-bold mb-1 text-[var(--color-text-secondary)]">{{ t('characters.sheet.personality.' + key) }}</div>
           <div v-if="!isEditing" class="text-xs italic leading-relaxed min-h-[1.5rem] whitespace-pre-wrap font-serif">
               {{ traits[key] || '...' }}
           </div>
           <textarea v-else
                     v-model="traits[key]"
                     class="w-full text-xs italic bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded p-2 focus:border-[var(--color-primary)] outline-none min-h-[3rem] resize-y"
                     :placeholder="t('characters.sheet.personality.enter', { trait: t('characters.sheet.personality.' + key) })"
           ></textarea>
       </div>
    </div>

    <!-- Features & Traits List -->
    <div class="section-container border-2 border-[var(--color-border)] rounded-lg p-3 bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] shadow-sm flex-grow">
      <div class="header flex justify-between items-center mb-3">
        <h3 class="text-xs uppercase font-bold text-[var(--color-text-secondary)] tracking-wider">{{ t('characters.sheet.traits.title') }}</h3>
        <button v-if="isEditing"
                class="text-[0.65rem] bg-[var(--color-bg-primary)] border border-[var(--color-border)] px-2 py-0.5 rounded hover:bg-[var(--color-bg-input)] transition-colors">
            <i class="fas fa-plus mr-1"></i> {{ t('characters.sheet.traits.add') }}
        </button>
      </div>

      <div class="feature-list space-y-3 overflow-y-auto max-h-[400px]">
          <div v-for="(feature, idx) in features" :key="idx" class="feature-item pb-2 border-b border-[var(--color-border)]/30 last:border-0">
               <div class="flex items-center gap-2 mb-1 cursor-pointer group-hover:text-ink-red" @click="$emit('show-details', { title: feature.name, subtitle: feature.source, content: feature.description })">
                   <h4 class="font-bold font-cinzel text-sm text-[var(--color-text-highlight)] group-hover:text-ink-red transition-colors">{{ feature.name }}</h4>
                   <span class="text-[0.6rem] px-1.5 py-0.5 rounded-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] uppercase tracking-wider">{{ feature.source }}</span>
               </div>
               <p class="text-xs leading-relaxed text-[var(--color-text-primary)] opacity-90">{{ feature.description }}</p>
          </div>
          <div v-if="!features || features.length === 0" class="text-center text-xs text-[var(--color-text-secondary)] opacity-60 italic py-4">
              {{ t('characters.sheet.traits.empty') }}
          </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'

interface Feature {
  name: string;
  source: string;
  description: string;
}

interface Personality {
    traits: string;
    ideals: string;
    bonds: string;
    flaws: string;
    [key: string]: string; // Index signature for v-for access
}

export default defineComponent({
  name: 'TraitsFeatures',
  emits: ['show-details'],
  props: {
    traits: {
      type: Object as PropType<Personality>,
      default: () => ({
          traits: '', ideals: '', bonds: '', flaws: ''
      })
    },
    features: {
      type: Array as PropType<Feature[]>,
      default: () => []
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  setup() {
      const { t } = useI18n()
      const personalityKeys = ['traits', 'ideals', 'bonds', 'flaws'];
      return {
          t,
          personalityKeys
      }
  }
})
</script>

<style scoped>
.font-cinzel {
    font-family: 'Cinzel', serif;
}
.font-serif {
    font-family: 'Merriweather', serif; /* or any readable serif font */
}
</style>