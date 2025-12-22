<template>
  <div class="character-info p-4 border-2 border-stone-800 rounded-sm bg-parchment-light relative overflow-hidden">
    <div class="flex flex-col gap-4">
      
      <!-- Name Panel -->
      <div class="w-full">
         <label class="text-[10px] uppercase font-serif font-bold text-stone-500 mb-0.5 block">{{ t('characters.sheet.header.characterName') }}</label>
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

      <!-- Attributes Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 p-3 border-t border-b border-stone-400/50 bg-white/20">
        
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
        <div class="flex flex-col col-span-1">
          <label class="text-[10px] uppercase font-bold text-stone-500">{{ t('characters.sheet.header.xp') }}</label>
          <div v-if="!isEditing" class="font-lora text-sm font-semibold truncate">
            {{ character.xp }}
          </div>
          <input v-else v-model.number="localCharacter.xp" type="number" class="font-lora text-sm bg-transparent border-b border-stone-300 focus:border-ink-red focus:outline-none" />
        </div>

         <!-- Player Name -->
        <div class="flex flex-col col-span-1">
          <label class="text-[10px] uppercase font-bold text-stone-500">{{ t('characters.sheet.header.playerName') }}</label>
          <div class="font-lora text-sm font-semibold truncate text-stone-400">
            (User)
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
  name: 'CharacterInfo',
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

    // Sync from parent prop to local mutable copy
    watch(() => props.modelValue, (newVal) => {
        localCharacter.value = { ...newVal };
    }, { deep: true });

    watch(localCharacter, (newVal) => {
       emit('update:modelValue', newVal);
    }, { deep: true });

    return {
      t,
      character,
      localCharacter
    }
  }
})
</script>