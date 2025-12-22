<template>
  <div class="attacks-spellcasting border-2 border-[var(--color-border)] rounded-lg p-3 bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] shadow-sm h-full flex flex-col">
    <!-- Header -->
    <div class="header flex justify-between items-center mb-3">
        <h3 class="text-xs uppercase font-bold text-[var(--color-text-secondary)] tracking-wider">{{ t('characters.sheet.attacks.title') }}</h3>
        <button v-if="isEditing"
                @click="addAttack"
                class="text-[0.65rem] bg-[var(--color-bg-primary)] border border-[var(--color-border)] px-2 py-0.5 rounded hover:bg-[var(--color-bg-input)] transition-colors">
            <i class="fas fa-plus mr-1"></i> {{ t('characters.sheet.attacks.add') }}
        </button>
    </div>

    <!-- Attacks Table -->
    <div class="flex-grow overflow-auto mb-3">
        <table class="w-full text-xs">
            <thead>
                <tr class="text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                    <th class="font-normal text-left pb-1 pl-1 w-1/2">{{ t('characters.sheet.attacks.name') }}</th>
                    <th class="font-normal text-center pb-1 w-1/6">{{ t('characters.sheet.attacks.atk') }}</th>
                    <th class="font-normal text-right pb-1 pr-1 w-1/3">{{ t('characters.sheet.attacks.dmgType') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(attack, index) in localAttacks" :key="index" class="border-b border-[var(--color-border)]/30 last:border-0 group">
                    <td class="py-1.5 pl-1 font-semibold font-cinzel">
                        <span v-if="!isEditing">{{ attack.name }}</span>
                        <input v-else v-model="attack.name" class="w-full bg-transparent border-b border-transparent focus:border-[var(--color-primary)] outline-none" :placeholder="t('characters.sheet.attacks.namePlaceholder')" />
                    </td>
                    <td class="py-1.5 text-center text-[var(--color-text-secondary)]">
                         <span v-if="!isEditing">{{ attack.bonus }}</span>
                        <input v-else v-model="attack.bonus" class="w-full text-center bg-transparent border-b border-transparent focus:border-[var(--color-primary)] outline-none" :placeholder="t('characters.sheet.placeholders.bonus')" />
                    </td>
                    <td class="py-1.5 pr-1 text-right">
                         <span v-if="!isEditing">{{ attack.damage }} <span class="text-[0.6rem] text-[var(--color-text-secondary)]">{{ attack.type }}</span></span>
                         <div v-else class="flex gap-1 justify-end">
                             <input v-model="attack.damage" class="w-12 text-right bg-transparent border-b border-transparent focus:border-[var(--color-primary)] outline-none" :placeholder="t('characters.sheet.placeholders.damage')" />
                             <input v-model="attack.type" class="w-12 text-right text-[0.6rem] bg-transparent border-b border-transparent focus:border-[var(--color-primary)] outline-none" :placeholder="t('characters.sheet.attacks.typePlaceholder')" />
                         </div>
                    </td>
                </tr>
                <!-- Spacer rows if list is short to maintain paper look -->
                <tr v-if="localAttacks.length < 3">
                     <td colspan="3" class="py-4 border-b border-[var(--color-border)]/10"></td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Spell Slots / Resources Area (Simplified) -->
    <div class="mt-auto pt-2 border-t-2 border-[var(--color-border)] border-dashed">
         <div v-if="resources && resources.length > 0">
             <div v-for="(res, idx) in resources" :key="idx" class="flex items-center justify-between mb-1 text-xs">
                 <span class="text-[var(--color-text-secondary)]">{{ res.name }}</span>
                 <div class="flex items-center gap-1">
                     <div v-if="!isEditing" class="flex gap-1">
                         <div v-for="i in res.total" :key="i" 
                              class="w-3 h-3 rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-primary)]"
                              :class="{ 'bg-[var(--color-primary)]': i <= res.current }">
                         </div>
                     </div>
                     <div v-else class="flex gap-1 items-center">
                         <input type="number" v-model.number="res.current" class="w-8 text-center bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded px-1 py-0.5" />
                         <span class="text-[var(--color-text-secondary)]">/</span>
                         <input type="number" v-model.number="res.total" class="w-8 text-center bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded px-1 py-0.5" />
                     </div>
                 </div>
             </div>
         </div>
         <div v-else class="text-center text-[var(--color-text-secondary)] py-2 text-xs italic opacity-50">
             {{ t('characters.sheet.attacks.noResources') }}
         </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PropType } from 'vue'

interface Attack {
  name: string;
  bonus: string;
  damage: string;
  type: string;
}

interface Resource {
    name: string;
    total: number;
    current: number;
}

export default defineComponent({
  name: 'AttacksSpellcasting',
  props: {
    attacks: {
      type: Array as PropType<Attack[]>,
      default: () => []
    },
    resources: {
        type: Array as PropType<Resource[]>,
        default: () => []
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
      const { t } = useI18n()
      const localAttacks = ref<Attack[]>([...props.attacks]);

      watch(() => props.attacks, (newVal) => {
          localAttacks.value = [...newVal];
      }, { deep: true });

      const addAttack = () => {
          console.log('Adding new attack row');
          localAttacks.value.push({
              name: t('characters.sheet.attacks.newAttack'),
              bonus: t('characters.sheet.placeholders.bonus'),
              damage: '1d4',
              type: t('characters.sheet.attacks.typePlaceholder')
          });
          // In a real app, emit update to parent
      };

      return {
          t,
          localAttacks,
          addAttack
      };
  }
})
</script>

<style scoped>
.font-cinzel {
    font-family: 'Cinzel', serif;
}
/* Custom scrollbar for the table area if needed */
.overflow-auto::-webkit-scrollbar {
    width: 4px;
}
.overflow-auto::-webkit-scrollbar-track {
    background: transparent;
}
.overflow-auto::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 2px;
}
</style>