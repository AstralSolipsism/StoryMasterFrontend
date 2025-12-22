<template>
  <div class="characters-container">
    <div class="h-full flex flex-col md:flex-row gap-6">
      <!-- Sidebar: Character List -->
      <aside class="w-full md:w-64 bg-stone-100/80 border border-stone-300 rounded p-4 flex flex-col md:h-[calc(100vh-100px)]">
        <h3 class="text-lg font-bold mb-4 uppercase tracking-widest text-ink-black border-b border-stone-300 pb-2">{{ $t('characters.heroes') }}</h3>
        <ul class="space-y-2 text-stone-700 flex-grow overflow-y-auto custom-scrollbar">
          <li
            v-for="char in mockCharacters"
            :key="char.id"
            @click="selectCharacter(char.id)"
            class="cursor-pointer p-2 rounded transition-all duration-200"
            :class="activeCharacterId === char.id ? 'bg-ink-red text-white shadow-md transform scale-105' : 'hover:bg-stone-200 hover:text-ink-red hover:translate-x-1'"
          >
            <div class="font-serif font-bold">{{ char.name }}</div>
            <div class="text-xs opacity-80">{{ $t('characters.level') }} {{ char.level }} {{ char.class }}</div>
          </li>
        </ul>
        
        <div class="mt-4 pt-4 border-t border-stone-300">
           <button class="w-full py-2 bg-stone-200 hover:bg-stone-300 text-stone-600 rounded font-bold uppercase text-xs transition-colors flex items-center justify-center gap-2">
             <i class="fas fa-plus"></i> {{ $t('characters.create') }}
           </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-grow md:h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar relative paper-texture rounded border border-stone-200">
        
        <div v-if="activeCharacter" class="h-full">
           <CharacterSheet 
             :character="activeCharacter" 
             :is-editing="isEditing"
           >
             <template #actions>
                 <button
                  @click="isEditing = !isEditing"
                  class="px-3 py-1 bg-stone-200 border border-stone-400 rounded text-xs font-bold uppercase hover:bg-stone-300 hover:text-ink-red transition-colors shadow-sm"
                 >
                   {{ isEditing ? $t('characters.sheet.actions.save') : $t('characters.sheet.actions.edit') }}
                 </button>
                 <button
                  class="px-3 py-1 bg-stone-200 border border-stone-400 rounded text-xs font-bold uppercase hover:bg-stone-300 hover:text-ink-red transition-colors shadow-sm"
                 >
                   {{ $t('characters.sheet.actions.export') }}
                 </button>
             </template>
           </CharacterSheet>
        </div>
        
        <div v-else class="flex flex-col items-center justify-center h-full text-stone-400 italic">
          <div class="text-6xl mb-4 opacity-20">
             <i class="fas fa-dungeon"></i>
          </div>
          <p>{{ $t('characters.noCharacterSelected') }}</p>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { mockCharacters } from '../services/mockData';
import CharacterSheet from '../components/character-sheet/CharacterSheet.vue';

const activeCharacterId = ref<string>(mockCharacters.value[0]?.id || '');
const isEditing = ref(false);

const activeCharacter = computed(() => mockCharacters.value.find(c => c.id === activeCharacterId.value));

const selectCharacter = (id: string) => {
    activeCharacterId.value = id;
    isEditing.value = false; // Reset edit mode on switch
};
</script>

<style scoped>
</style>
