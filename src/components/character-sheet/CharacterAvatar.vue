<template>
  <div class="character-avatar w-full flex flex-col items-center">
    <!-- Avatar Frame: Fixed aspect ratio (Portrait 3:4), centered, responsible size -->
    <div class="relative w-full aspect-[3/4] rounded-lg border-4 border-stone-800 overflow-hidden shadow-lg bg-stone-200 group">
        <img
          :src="localCharacter.avatar || defaultAvatar"
          alt="Character Avatar"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          @error="handleImageError"
        />
        <!-- Edit Overlay -->
        <div v-if="isEditing" class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <i class="fas fa-camera text-white text-2xl mb-2"></i>
            <span class="text-white text-xs font-bold uppercase tracking-wider">{{ t('characters.sheet.header.editAvatar') }}</span>
             <input type="text" v-model="localCharacter.avatar" class="absolute inset-0 opacity-0 cursor-pointer" title="Paste Image URL" />
        </div>
    </div>
    
    <!-- Optional: Character Level Badge under avatar for visual flair -->
    <div class="mt-4 flex flex-col items-center">
        <div class="text-xs font-bold uppercase text-stone-500 tracking-widest">{{ t('characters.fields.level') }}</div>
        <div class="font-cinzel text-3xl font-bold text-ink-red">{{ localCharacter.level }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PropType } from 'vue'
import type { CharacterSheet } from '../../services/mockData';

export default defineComponent({
  name: 'CharacterAvatar',
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
    const localCharacter = ref<CharacterSheet>({ ...props.modelValue });
    const defaultAvatar = 'https://www.dndbeyond.com/content/skins/waterdeep/images/characters/default-avatar.jpg';

    watch(() => props.modelValue, (newVal) => {
        localCharacter.value = { ...newVal };
    }, { deep: true });

    watch(localCharacter, (newVal) => {
       emit('update:modelValue', newVal);
    }, { deep: true });

    const handleImageError = (e: Event) => {
        (e.target as HTMLImageElement).src = defaultAvatar;
    };

    return {
      t,
      localCharacter,
      defaultAvatar,
      handleImageError
    }
  }
})
</script>