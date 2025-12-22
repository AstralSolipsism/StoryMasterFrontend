<template>
  <div class="character-header p-4 border-2 border-stone-800 rounded-sm bg-parchment-light relative overflow-hidden">
    <!-- Decorative border corners/elements could be added here -->
    
    <div class="flex flex-col gap-4">
      
      <!-- Character Avatar & Name Section -->
      <div class="w-full flex flex-row items-center gap-4">
          <!-- Avatar Frame -->
          <div class="relative w-24 h-24 rounded-full border-4 border-stone-800 overflow-hidden shadow-lg bg-stone-200 group flex-shrink-0">
              <img
                :src="localCharacter.avatar || defaultAvatar"
                alt="Character Avatar"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
              <div v-if="isEditing" class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span class="text-white text-xs font-bold">{{ t('characters.sheet.header.editAvatar') }}</span>
                   <input type="text" v-model="localCharacter.avatar" class="absolute inset-0 opacity-0 cursor-pointer" title="Paste Image URL" />
              </div>
          </div>

          <!-- Name Panel -->
          <div class="flex-grow min-w-0">
             <label v-if="!isFunction" class="text-[10px] uppercase font-serif font-bold text-stone-500 mb-0.5 block">{{ t('characters.sheet.header.characterName') }}</label>
             <div v-if="!isEditing" class="font-cinzel text-2xl font-bold text-ink-black border-b-2 border-stone-800 pb-1 truncate" :title="character.name">
              {{ character.name }}
            </div>
            <input
              v-else
              v-model="localCharacter.name"
              class="font-cinzel text-2xl font-bold text-ink-black border-b-2 border-stone-800 pb-1 bg-transparent focus:outline-none focus:border-ink-red w-full"
              type="text"
              :placeholder="t('characters.sheet.header.namePlaceholder')"
            />
          </div>
      </div>

      <!-- Character Info Section -->
      <div class="flex-col justify-end">

          <!-- Attributes Grid -->
          <div class="grid grid-cols-2 gap-3 p-3 border-t border-b border-stone-400/50 bg-white/20">
            
            <!-- Class & Level -->
            <div class="flex flex-col">
              <label class="text-[10px] uppercase font-bold text-stone-500">{{ t('characters.sheet.header.classLevel') }}</label>
              <div v-if="!isEditing" class="font-lora text-sm font-semibold truncate">
                {{ character.class }} {{ character.level }}
              </div>
              <div v-else class="flex gap-1">
                <input v-model="localCharacter.class" class="font-lora text-sm w-2/3 bg-transparent border-b border-stone-300 focus:border-ink-red focus:outline-none" :placeholder="t('characters.sheet.header.classPlaceholder')" />
                <input v-model.number="localCharacter.level" type="number" class="font-lora text-sm w-1/3 bg-transparent border-b border-stone-300 focus:border-ink-red focus:outline-none" :placeholder="t('characters.sheet.placeholders.level')" />
              </div>
            </div>

            <!-- Race -->
            <div class="flex flex-col">
              <label class="text-[10px] uppercase font-bold text-stone-500">{{ t('characters.sheet.header.race') }}</label>
              <div v-if="!isEditing" class="font-lora text-sm font-semibold truncate">
                {{ character.race }}
              </div>
              <input v-else v-model="localCharacter.race" class="font-lora text-sm bg-transparent border-b border-stone-300 focus:border-ink-red focus:outline-none" />
            </div>

            <!-- Background -->
            <div class="flex flex-col">
              <label class="text-[10px] uppercase font-bold text-stone-500">{{ t('characters.sheet.header.background') }}</label>
              <div v-if="!isEditing" class="font-lora text-sm font-semibold truncate">
                {{ character.background }}
              </div>
              <input v-else v-model="localCharacter.background" class="font-lora text-sm bg-transparent border-b border-stone-300 focus:border-ink-red focus:outline-none" />
            </div>

            <!-- Alignment -->
            <div class="flex flex-col">
              <label class="text-[10px] uppercase font-bold text-stone-500">{{ t('characters.sheet.header.alignment') }}</label>
              <div v-if="!isEditing" class="font-lora text-sm font-semibold truncate">
                {{ character.alignment }}
              </div>
              <input v-else v-model="localCharacter.alignment" class="font-lora text-sm bg-transparent border-b border-stone-300 focus:border-ink-red focus:outline-none" />
            </div>

            <!-- Experience Points -->
            <div class="flex flex-col md:col-span-2">
              <label class="text-[10px] uppercase font-bold text-stone-500">{{ t('characters.sheet.header.xp') }}</label>
              <div v-if="!isEditing" class="font-lora text-sm font-semibold truncate">
                {{ character.xp }}
              </div>
              <input v-else v-model.number="localCharacter.xp" type="number" class="font-lora text-sm bg-transparent border-b border-stone-300 focus:border-ink-red focus:outline-none" />
            </div>

             <!-- Player Name -->
            <div class="flex flex-col md:col-span-2">
              <label class="text-[10px] uppercase font-bold text-stone-500">{{ t('characters.sheet.header.playerName') }}</label>
              <div class="font-lora text-sm font-semibold truncate text-stone-400">
                (User)
              </div>
            </div>

          </div>

      </div>
    </div>
    

  </div>
</template>

<script lang="ts">
import { defineComponent, toRef, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PropType } from 'vue'
import type { CharacterSheet } from '../../services/mockData';

export default defineComponent({
  name: 'CharacterHeader',
  props: {
    modelValue: {
      type: Object as PropType<CharacterSheet>,
      required: true
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const character = toRef(props, 'modelValue');
    const localCharacter = ref<CharacterSheet>({ ...character.value });
    const defaultAvatar = 'https://www.dndbeyond.com/content/skins/waterdeep/images/characters/default-avatar.jpg'; // Generic fallback

    // Sync from parent prop to local mutable copy
    watch(() => props.modelValue, (newVal) => {
        localCharacter.value = { ...newVal };
    }, { deep: true });

    watch(localCharacter, (newVal) => {
       emit('update:modelValue', newVal);
    }, { deep: true });

    const handleImageError = (e: Event) => {
        (e.target as HTMLImageElement).src = defaultAvatar;
    };
    
    // Just a helper to check property existence safely effectively acting as a dummy
    const isFunction = false;

    return {
      t,
      character,
      localCharacter,
      isFunction,
      defaultAvatar,
      handleImageError
    }
  }
})
</script>

<style scoped>
/* Specific overrides if Tailwind isn't enough */
.character-header {
  box-shadow: inset 0 0 20px rgba(0,0,0,0.05);
}
</style>