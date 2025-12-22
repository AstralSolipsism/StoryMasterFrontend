<template>
  <div class="combat-stats-panel p-4 flex flex-col gap-4 text-[var(--color-text-primary)]">
    <!-- Row 1: AC, Initiative, Speed -->
    <div class="grid grid-cols-3 gap-4">
      <!-- Armor Class -->
      <div class="stat-box flex flex-col items-center justify-center p-2 border-2 border-[var(--color-border)] rounded-lg bg-[var(--color-bg-soft)] relative shadow-sm">
        <div class="text-[0.65rem] uppercase tracking-wide font-bold mb-1 text-[var(--color-text-secondary)]">{{ t('characters.sheet.combat.armorClass') }}</div>
        <div v-if="!isEditing" class="text-3xl font-cinzel font-bold text-[var(--color-text-highlight)]">{{ character.ac }}</div>
        <input v-else type="number" v-model.number="character.ac" class="w-12 text-center text-2xl font-cinzel font-bold bg-transparent border-b border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
        <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
             <i class="fas fa-shield-alt text-[var(--color-text-secondary)] opacity-20 text-4xl"></i>
        </div>
      </div>

      <!-- Initiative -->
      <div class="stat-box flex flex-col items-center justify-center p-2 border-2 border-[var(--color-border)] rounded-lg bg-[var(--color-bg-soft)] shadow-sm">
        <div class="text-[0.65rem] uppercase tracking-wide font-bold mb-1 text-[var(--color-text-secondary)]">{{ t('characters.sheet.combat.initiative') }}</div>
        <div class="text-3xl font-cinzel font-bold">{{ initiativeDisplay }}</div>
      </div>

      <!-- Speed -->
      <div class="stat-box flex flex-col items-center justify-center p-2 border-2 border-[var(--color-border)] rounded-lg bg-[var(--color-bg-soft)] shadow-sm">
        <div class="text-[0.65rem] uppercase tracking-wide font-bold mb-1 text-[var(--color-text-secondary)]">{{ t('characters.sheet.combat.speed') }}</div>
        <div v-if="!isEditing" class="text-3xl font-cinzel font-bold">{{ character.speed }}</div>
        <div v-else class="flex items-center justify-center">
             <input type="number" v-model.number="character.speed" class="w-12 text-center text-xl font-cinzel font-bold bg-transparent border-b border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
             <span class="text-xs ml-1 text-[var(--color-text-secondary)]">ft.</span>
        </div>
      </div>
    </div>

    <!-- Row 2: HP -->
    <div class="hp-box border-2 border-[var(--color-border)] rounded-lg p-3 bg-[var(--color-bg-soft)] shadow-sm relative group">
      <div class="flex justify-between items-center mb-2">
        <div class="text-xs uppercase font-bold text-[var(--color-text-secondary)]">{{ t('characters.sheet.combat.hitPoints') }}</div>
        <div class="text-xs text-[var(--color-text-secondary)] font-mono">{{ t('characters.sheet.combat.max') }}: {{ character.hp.max }}</div>
      </div>
      
      <div class="relative w-full h-8 bg-gray-900/50 rounded-md overflow-hidden mb-2 border border-[var(--color-border)] box-shadow-inner">
        <!-- Temp HP Bar (Yellow overlay) -->
        <div 
            v-if="character.hp.temp"
            class="absolute top-0 left-0 h-full bg-yellow-500/60 z-10 transition-all duration-300"
            :style="{ width: Math.min((character.hp.temp / character.hp.max) * 100, 100) + '%' }"
        ></div>
        <!-- Current HP Bar -->
        <div 
            class="absolute top-0 left-0 h-full bg-red-700/80 transition-all duration-300 z-0" 
            :style="{ width: hpPercentage + '%' }"
        ></div>
        
        <!-- Text Overlay -->
        <div class="absolute inset-0 flex items-center justify-center text-sm font-bold text-white shadow-black drop-shadow-md z-20 font-mono tracking-wider">
            {{ character.hp.current }} <span class="mx-1 text-gray-400">/</span> {{ character.hp.max }}
            <span v-if="character.hp.temp" class="ml-2 text-yellow-300">(+{{ character.hp.temp }})</span>
        </div>
      </div>

      <div v-if="isEditing" class="flex gap-2 justify-center mt-3 pt-2 border-t border-[var(--color-border)]/30">
        <div class="flex flex-col items-center">
          <label class="text-[0.6rem] text-[var(--color-text-secondary)] mb-0.5">{{ t('characters.sheet.combat.current') }}</label>
          <input type="number" v-model.number="character.hp.current" class="w-16 text-center text-sm bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded px-1 py-0.5 focus:border-[var(--color-primary)] outline-none" />
        </div>
        <div class="flex flex-col items-center">
           <label class="text-[0.6rem] text-[var(--color-text-secondary)] mb-0.5">{{ t('characters.sheet.combat.max') }}</label>
          <input type="number" v-model.number="character.hp.max" class="w-16 text-center text-sm bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded px-1 py-0.5 focus:border-[var(--color-primary)] outline-none" />
        </div>
        <div class="flex flex-col items-center">
           <label class="text-[0.6rem] text-[var(--color-text-secondary)] mb-0.5">{{ t('characters.sheet.combat.temp') }}</label>
          <input type="number" v-model.number="character.hp.temp" class="w-16 text-center text-sm bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded px-1 py-0.5 focus:border-[var(--color-primary)] outline-none" />
        </div>
      </div>
    </div>

    <!-- Row 3: Hit Dice & Death Saves -->
    <div class="grid grid-cols-2 gap-4">
        <!-- Hit Dice -->
        <div class="stat-box border-2 border-[var(--color-border)] rounded-lg p-2 bg-[var(--color-bg-soft)] flex flex-col items-center justify-center shadow-sm">
            <div class="text-[0.65rem] uppercase tracking-wide font-bold mb-1 text-[var(--color-text-secondary)]">{{ t('characters.sheet.combat.hitDice') }}</div>
            <div class="text-sm text-[var(--color-text-secondary)]">
                {{ t('characters.sheet.combat.total') }}: <span class="font-semibold text-[var(--color-text-primary)]">{{ character.hitDice.total }}</span>
            </div>
            <div v-if="isEditing" class="mt-2 flex items-center gap-2">
                <span class="text-xs text-[var(--color-text-secondary)]">{{ t('characters.sheet.combat.left') }}:</span>
                <input type="number" v-model.number="character.hitDice.current" class="w-12 text-center text-sm bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded py-0.5" />
            </div>
            <div v-else class="text-2xl font-cinzel font-bold mt-1">
                {{ character.hitDice.current }}
            </div>
        </div>

        <!-- Death Saves -->
        <div class="stat-box border-2 border-[var(--color-border)] rounded-lg p-2 bg-[var(--color-bg-soft)] flex flex-col justify-center gap-2 shadow-sm">
            <div class="text-[0.65rem] uppercase tracking-wide font-bold text-center text-[var(--color-text-secondary)]">{{ t('characters.sheet.combat.deathSaves') }}</div>
            
            <div class="flex items-center justify-between px-1 text-xs">
                <span class="font-semibold w-12 text-right mr-2">{{ t('characters.sheet.combat.success') }}</span>
                <div class="flex gap-2">
                    <div v-for="i in 3" :key="'s'+i" 
                         class="w-4 h-4 rounded-full border-2 border-[var(--color-border)] cursor-pointer transition-colors duration-200 flex items-center justify-center"
                         :class="{ 'bg-green-600 border-green-700': (character.deathSaves?.successes || 0) >= i, 'hover:bg-green-600/30': isEditing }"
                         @click="isEditing ? toggleDeathSave('successes', i) : null">
                         <i v-if="(character.deathSaves?.successes || 0) >= i" class="fas fa-check text-[0.5rem] text-white"></i>
                    </div>
                </div>
            </div>
            <div class="flex items-center justify-between px-1 text-xs">
                <span class="font-semibold w-12 text-right mr-2">{{ t('characters.sheet.combat.failure') }}</span>
                <div class="flex gap-2">
                    <div v-for="i in 3" :key="'f'+i"
                         class="w-4 h-4 rounded-full border-2 border-[var(--color-border)] cursor-pointer transition-colors duration-200 flex items-center justify-center"
                         :class="{ 'bg-red-600 border-red-700': (character.deathSaves?.failures || 0) >= i, 'hover:bg-red-600/30': isEditing }"
                         @click="isEditing ? toggleDeathSave('failures', i) : null">
                         <i v-if="(character.deathSaves?.failures || 0) >= i" class="fas fa-times text-[0.5rem] text-white"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PropType } from 'vue'
import type { CharacterSheet } from '../../services/mockData'

export default defineComponent({
  name: 'CombatStatsPanel',
  props: {
    character: {
      type: Object as PropType<CharacterSheet>,
      required: true
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { t } = useI18n()
    const initiativeDisplay = computed(() => {
        if (props.character.initiative !== undefined) {
            return props.character.initiative >= 0 ? `+${props.character.initiative}` : props.character.initiative;
        }
        const dex = props.character.stats.dex;
        const mod = Math.floor((dex - 10) / 2);
        return mod >= 0 ? `+${mod}` : mod;
    });

    const hpPercentage = computed(() => {
        const { current, max } = props.character.hp;
        const percent = (current / max) * 100;
        return Math.min(Math.max(percent, 0), 100);
    });

    const toggleDeathSave = (type: 'successes' | 'failures', index: number) => {
        if (!props.character.deathSaves) {
            props.character.deathSaves = { successes: 0, failures: 0 };
        }
        
        const currentVal = props.character.deathSaves[type];
        if (currentVal === index) {
            props.character.deathSaves[type] = index - 1;
        } else {
            props.character.deathSaves[type] = index;
        }
    };

    return {
      t,
      initiativeDisplay,
      hpPercentage,
      toggleDeathSave
    };
  }
})
</script>

<style scoped>
/* 
  Ensuring font-cinzel is available, though usually it's in main.css 
  If not importing google fonts, might need to rely on fallback.
*/
.font-cinzel {
    font-family: 'Cinzel', serif;
}

.box-shadow-inner {
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.3);
}
</style>