<template>
  <div class="character-sheet w-full max-w-[1200px] glass-panel-md p-4 md:p-6 relative text-stone-900">
    <div class="absolute top-4 right-4 flex gap-2 no-print z-10">
      <button
        @click="showGraph = true"
        class="px-3 py-1 glass-panel-sm glass-hover text-xs font-bold uppercase hover:text-ink-red transition-colors flex items-center gap-1">
        <i class="fas fa-project-diagram"></i>
        <span class="hidden sm:inline">{{ $t('characters.sheet.actions.relations') }}</span>
      </button>
      <button
        @click="openInventory"
        class="px-3 py-1 glass-panel-sm glass-hover text-xs font-bold uppercase hover:text-ink-red transition-colors flex items-center gap-1">
        <i class="fas fa-suitcase"></i>
        <span class="hidden sm:inline">{{ $t('characters.sheet.actions.inventory') }}</span>
      </button>
      <slot name="actions"></slot>
    </div>

    <!-- Main Grid: Using 12-column grid for precise control -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
      
      <!-- Column 1: Avatar & Skills (Left Side) - Spans 3 cols (25%) -->
      <div class="lg:col-span-3 space-y-6">
        <!-- 仅展示角色头像 -->
        <CharacterAvatar v-model="localCharacter" :is-editing="isEditing" />
        
        <!-- SkillsSavesPanel 放在头像下方 -->
        <SkillsSavesPanel
          :character="character"
          :is-editing="isEditing"
          @show-details="handleShowDetails"
        />
      </div>

      <!-- Column 2: Core Info & Combat (Middle - Wide) - Spans 6 cols (50%) -->
      <div class="lg:col-span-6 flex flex-col gap-6">
        
        <!-- Row 1: Header Information -->
        <CharacterInfo v-model="localCharacter" :is-editing="isEditing" />

        <!-- Row 2: Ability Scores (Horizontal) -->
        <AbilityScoreBlock
          :stats="character?.stats"
          :is-editing="isEditing"
          :horizontal="true"
        />

        <!-- Row 3: Grid within Grid for Combat & Attacks -->
        <div class="grid grid-cols-1 gap-6">
            <!-- Combat Stats Panel -->
            <div>
                 <CombatStatsPanel
                    :character="character"
                    :is-editing="isEditing"
                  />
            </div>
            
            <!-- Attacks & Spellcasting -->
            <div>
                 <AttacksSpellcasting
                    :attacks="character?.attacks"
                    :resources="character?.resources"
                    :is-editing="isEditing"
                  />
            </div>
        </div>

      </div>

      <!-- Column 3: Traits & Features (Right Side) - Spans 3 cols (25%) -->
      <div class="lg:col-span-3 space-y-6">
        <TraitsFeatures
          :traits="character?.personality"
          :features="character?.features"
          :is-editing="isEditing"
          @show-details="handleShowDetails"
        />
      </div>

    </div>

    <!-- Slide Over for Details -->
    <DetailSlideOver
      :is-open="detailsState.isOpen"
      :title="detailsState.title"
      :subtitle="detailsState.subtitle"
      :content="detailsState.content"
      @close="detailsState.isOpen = false"
    >
        <InventoryPanel v-if="detailsState.isInventory" :inventory="character?.inventory" :is-editing="isEditing" />
    </DetailSlideOver>

    <!-- Relationship Graph Modal -->
    <RelationshipGraphModal
      :is-open="showGraph"
      :character-id="character.id"
      @close="showGraph = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, watch, reactive } from 'vue'
import CharacterAvatar from './CharacterAvatar.vue'
import CharacterInfo from './CharacterInfo.vue'
import AbilityScoreBlock from './AbilityScoreBlock.vue'
import SkillsSavesPanel from './SkillsSavesPanel.vue'
import CombatStatsPanel from './CombatStatsPanel.vue'
import AttacksSpellcasting from './AttacksSpellcasting.vue'
import InventoryPanel from './InventoryPanel.vue'
import TraitsFeatures from './TraitsFeatures.vue'
import DetailSlideOver from './DetailSlideOver.vue'
import RelationshipGraphModal from './RelationshipGraphModal.vue'

export default defineComponent({
  name: 'CharacterSheet',
  components: {
    CharacterAvatar,
    CharacterInfo,
    AbilityScoreBlock,
    SkillsSavesPanel,
    CombatStatsPanel,
    AttacksSpellcasting,
    InventoryPanel,
    TraitsFeatures,
    DetailSlideOver,
    RelationshipGraphModal
  },
  props: {
    character: {
      type: Object as PropType<any>, // Type will be defined more strictly later
      required: true
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
     const localCharacter = ref(props.character);
     
     const detailsState = reactive({
        isOpen: false,
        title: '',
        subtitle: '',
        content: '',
        isInventory: false
      });
      
      const showGraph = ref(false);
 
      const handleShowDetails = (payload: { title: string; subtitle?: string; content: string }) => {
        detailsState.title = payload.title;
        detailsState.subtitle = payload.subtitle || '';
        detailsState.content = payload.content;
        detailsState.isInventory = false;
        detailsState.isOpen = true;
      };
 
      const openInventory = () => {
         detailsState.title = 'Inventory';
         detailsState.subtitle = 'Equipment & Tools';
         detailsState.content = '';
         detailsState.isInventory = true;
         detailsState.isOpen = true;
      }
 
      watch(() => props.character, (newVal: any) => {
         localCharacter.value = newVal;
     });

     return {
       localCharacter,
       detailsState,
       showGraph,
       handleShowDetails,
       openInventory
     };
  }
})
</script>

<style scoped>
</style>