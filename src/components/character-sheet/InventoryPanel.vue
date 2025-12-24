<template>
  <div class="inventory-panel border-2 border-[var(--color-border)] rounded-lg p-3 bg-white/40 backdrop-blur-sm text-[var(--color-text-primary)] shadow-sm flex flex-col h-full min-h-[200px]">
    <!-- Header -->
    <div class="header flex justify-between items-center mb-3">
        <h3 class="text-xs uppercase font-bold text-[var(--color-text-secondary)] tracking-wider">{{ t('characters.inventory.title') }}</h3>
        <button v-if="isEditing"
                @click="addItem"
                class="text-[0.65rem] bg-[var(--color-bg-primary)] border border-[var(--color-border)] px-2 py-0.5 rounded hover:bg-[var(--color-bg-input)] transition-colors">
            <i class="fas fa-plus mr-1"></i> {{ t('characters.inventory.addItem') }}
        </button>
    </div>

    <!-- Inventory Table -->
    <div class="flex-grow overflow-auto mb-1">
        <table class="w-full text-xs">
            <thead>
                <tr class="text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                    <th class="font-normal text-left pb-1 pl-1 w-1/3">{{ t('characters.inventory.itemName') }}</th>
                    <th class="font-normal text-center pb-1 w-1/6">{{ t('characters.inventory.qty') }}</th>
                    <th class="font-normal text-center pb-1 w-1/6">{{ t('characters.inventory.weight') }}</th>
                    <th class="font-normal text-left pb-1 pl-2 w-1/3">{{ t('characters.inventory.notes') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in localInventory" :key="index" class="border-b border-[var(--color-border)]/30 last:border-0 group hover:bg-[var(--color-bg-primary)]/30 transition-colors">
                    <td class="py-1.5 pl-1 font-semibold font-cinzel">
                        <span v-if="!isEditing">{{ getItemName(item.id) }}</span>
                         <input v-else v-model="item.id" class="w-full bg-transparent border-b border-transparent focus:border-[var(--color-primary)] outline-none" :placeholder="t('characters.inventory.itemPlaceholder')" />
                    </td>
                    <td class="py-1.5 text-center text-[var(--color-text-secondary)]">
                         <span v-if="!isEditing">{{ item.qty }}</span>
                        <input v-else type="number" v-model.number="item.qty" class="w-full text-center bg-transparent border-b border-transparent focus:border-[var(--color-primary)] outline-none" :placeholder="t('characters.sheet.placeholders.qty')" />
                    </td>
                    <td class="py-1.5 text-center text-[var(--color-text-secondary)]">
                         <span v-if="!isEditing">{{ item.weight || '-' }}</span>
                        <input v-else v-model="item.weight" class="w-full text-center bg-transparent border-b border-transparent focus:border-[var(--color-primary)] outline-none" :placeholder="t('characters.sheet.placeholders.weight')" />
                    </td>
                     <td class="py-1.5 pl-2 text-[var(--color-text-secondary)] italic">
                         <span v-if="!isEditing">{{ item.notes || '-' }}</span>
                        <input v-else v-model="item.notes" class="w-full bg-transparent border-b border-transparent focus:border-[var(--color-primary)] outline-none" :placeholder="t('characters.inventory.notesPlaceholder')" />
                    </td>
                </tr>
                <!-- Spacer rows -->
                <tr v-if="localInventory.length === 0">
                     <td colspan="4" class="py-4 text-center text-[var(--color-text-secondary)] italic opacity-50">{{ t('characters.inventory.empty') }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <!-- Footer stats (e.g. Total Weight) could go here -->
    <div class="mt-auto pt-2 border-t border-[var(--color-border)]/50 text-[0.65rem] text-[var(--color-text-secondary)] text-right flex justify-between items-center">
        <span><i class="fas fa-coins text-yellow-600 mr-1"></i> GP: <span v-if="!isEditing">15</span><input v-else class="w-8 text-right bg-transparent border-b border-stone-300" value="15"/></span>
        <span>{{ t('characters.inventory.totalWeight') }}: {{ totalWeight }} lb</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PropType } from 'vue'
import { mockEntities } from '../../services/mockData'

interface InventoryItem {
    id: string;
    qty: number;
    weight?: string;
    notes?: string;
}

export default defineComponent({
  name: 'InventoryPanel',
  props: {
    inventory: {
      type: Array as PropType<InventoryItem[]>,
      default: () => []
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
      const { t } = useI18n()
      const localInventory = ref<InventoryItem[]>([...props.inventory]);

      watch(() => props.inventory, (newVal) => {
          localInventory.value = [...newVal];
      }, { deep: true });

      const getItemName = (id: string) => {
          const entity = mockEntities.value[id];
          return entity ? entity.name : id; // Fallback to ID if not found
      };

      const addItem = () => {
          localInventory.value.push({
              id: t('characters.inventory.newItem'),
              qty: 1,
              weight: '0',
              notes: ''
          });
      };
      
      const totalWeight = computed(() => {
          return localInventory.value.reduce((acc, item) => {
              const weightVal = parseFloat(item.weight || '0');
              return acc + (isNaN(weightVal) ? 0 : weightVal * item.qty);
          }, 0);
      });

      return {
          t,
          localInventory,
          getItemName,
          addItem,
          totalWeight
      };
  }
})
</script>

<style scoped>
.font-cinzel {
    font-family: 'Cinzel', serif;
}
/* Custom scrollbar */
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