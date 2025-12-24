<template>
  <div class="skills-saves-panel flex flex-col gap-4">
    
    <!-- Saving Throws Section -->
    <div class="border border-stone-300 rounded p-2 bg-white/20 backdrop-blur-sm">
      <h3 class="font-cinzel text-xs font-bold uppercase border-b border-stone-300 mb-2 pb-1 text-center">{{ t('characters.sheet.savings') }}</h3>
      <div class="flex flex-col gap-1">
        <div v-for="stat in statsList" :key="stat" class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-2">
            <div
              class="w-3 h-3 rounded-full border border-stone-800 cursor-pointer"
              :class="{ 'bg-ink-black': isProficientSave(stat) }"
              @click="isEditing ? toggleSaveProficiency(stat) : null"
            ></div>
            <span class="font-bold text-xs uppercase text-stone-600 w-8 cursor-pointer hover:text-ink-red" @click="$emit('show-details', { title: t('characters.sheet.savingThrow') + ': ' + t('characters.stats.' + stat), content: t('characters.sheet.savingsDetail', { stat: t('characters.stats.' + stat) }) })">{{ t('characters.stats.' + stat) }}</span>
          </div>
          <span class="font-lora font-bold text-ink-black">
            {{ formatModifier(calculateSave(stat)) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Skills Section -->
    <div class="border border-stone-300 rounded p-2 bg-white/20 backdrop-blur-sm flex-grow">
      <h3 class="font-cinzel text-xs font-bold uppercase border-b border-stone-300 mb-2 pb-1 text-center">{{ t('characters.sheet.skills') }}</h3>
      <div class="flex flex-col gap-1">
        <div v-for="skill in skillsList" :key="skill.key" class="flex items-center justify-between text-sm hover:bg-stone-200/50 px-1 rounded">
          <div class="flex items-center gap-2">
            <!-- Proficiency Dot -->
            <div
              class="w-3 h-3 rounded-full border border-stone-800 cursor-pointer"
              :class="{ 'bg-ink-black': isProficientSkill(skill.key) }"
              @click="isEditing ? toggleSkillProficiency(skill.key) : null"
            ></div>
            
            <span class="font-lora text-stone-800 cursor-pointer hover:text-ink-red" @click="$emit('show-details', { title: t('characters.skills.' + skill.key), content: t('characters.sheet.skillDetail', { skill: t('characters.skills.' + skill.key) }) })">
              {{ t('characters.skills.' + skill.key) }}
              <span class="text-[10px] text-stone-500 uppercase ml-1">({{ t('characters.stats.' + skill.stat) }})</span>
            </span>
          </div>
          <span class="font-lora font-bold text-ink-black">
            {{ formatModifier(calculateSkill(skill)) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Passive Wisdom (Perception) -->
    <div class="border border-stone-300 rounded p-2 bg-white/20 backdrop-blur-sm flex items-center justify-between">
      <span class="font-bold text-xs uppercase text-stone-600">{{ t('characters.sheet.passivePerception') }}</span>
      <span class="font-lora font-bold text-xl text-ink-black">{{ calculatePassivePerception() }}</span>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CharacterSheet } from '../../services/mockData';

export default defineComponent({
  name: 'SkillsSavesPanel',
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
  emits: ['update:character', 'show-details'],
  setup(props, { emit }) {
    const { t } = useI18n()

    const statsList = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

    const skillsList = [
      { key: 'acrobatics', stat: 'dex' },
      { key: 'animal_handling', stat: 'wis' },
      { key: 'arcana', stat: 'int' },
      { key: 'athletics', stat: 'str' },
      { key: 'deception', stat: 'cha' },
      { key: 'history', stat: 'int' },
      { key: 'insight', stat: 'wis' },
      { key: 'intimidation', stat: 'cha' },
      { key: 'investigation', stat: 'int' },
      { key: 'medicine', stat: 'wis' },
      { key: 'nature', stat: 'int' },
      { key: 'perception', stat: 'wis' },
      { key: 'performance', stat: 'cha' },
      { key: 'persuasion', stat: 'cha' },
      { key: 'religion', stat: 'int' },
      { key: 'sleight_of_hand', stat: 'dex' },
      { key: 'stealth', stat: 'dex' },
      { key: 'survival', stat: 'wis' },
    ];

    const getModifier = (statName: string) => {
        const score = props.character.stats[statName as keyof typeof props.character.stats] || 10;
        return Math.floor((score - 10) / 2);
    };

    const isProficientSave = (stat: string) => {
        return props.character.proficiencies?.savingThrows.includes(stat);
    };

    const isProficientSkill = (skillKey: string) => {
        return props.character.proficiencies?.skills.includes(skillKey);
    };

    const calculateSave = (stat: string) => {
        let mod = getModifier(stat);
        if (isProficientSave(stat)) {
            mod += props.character.proficiencyBonus;
        }
        return mod;
    };

    const calculateSkill = (skill: { key: string; stat: string }) => {
        let mod = getModifier(skill.stat);
        if (isProficientSkill(skill.key)) {
            mod += props.character.proficiencyBonus;
        }
        return mod;
    };

    const calculatePassivePerception = () => {
        return 10 + calculateSkill({ key: 'perception', stat: 'wis' });
    };

    const formatModifier = (mod: number) => {
      return mod >= 0 ? `+${mod}` : `${mod}`;
    };

    // Toggle logic for editing
    const toggleSaveProficiency = (stat: string) => {
        const char = { ...props.character };
        const saves = new Set(char.proficiencies.savingThrows);
        if (saves.has(stat)) {
            saves.delete(stat);
        } else {
            saves.add(stat);
        }
        char.proficiencies.savingThrows = Array.from(saves);
        emit('update:character', char); // CharacterSheet needs to listen for this if supported
    };

    const toggleSkillProficiency = (skillKey: string) => {
        const char = { ...props.character };
        const skills = new Set(char.proficiencies.skills);
        if (skills.has(skillKey)) {
            skills.delete(skillKey);
        } else {
            skills.add(skillKey);
        }
        char.proficiencies.skills = Array.from(skills);
        emit('update:character', char);
    };

    return {
      t,
      statsList,
      skillsList,
      isProficientSave,
      isProficientSkill,
      calculateSave,
      calculateSkill,
      calculatePassivePerception,
      formatModifier,
      toggleSaveProficiency,
      toggleSkillProficiency
    }
  }
})
</script>

<style scoped>
/* Scrollbar needed if list is too long for container, but we design for full view usually */
</style>