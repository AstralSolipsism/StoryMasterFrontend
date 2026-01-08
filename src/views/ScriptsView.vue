<template>
  <div class="scripts-container">
    <div class="paper-card glass-panel-md min-h-[80vh] relative overflow-hidden">
      <!-- Decorative header -->
      <div class="border-b-2 border-ink-red mb-6 pb-2">
        <h2 class="text-3xl font-serif text-ink-red">{{ $t('scripts.title') }}</h2>
        <p class="text-stone-600 italic">{{ $t('scripts.subtitle') }}</p>
      </div>

      <!-- Main Layout -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
        <!-- Sidebar: Script List -->
        <aside class="md:col-span-1 border-r border-stone-300 pr-4">
          <h3 class="text-lg font-bold mb-4 uppercase tracking-widest text-ink-black">{{ $t('scripts.adventures') }}</h3>
          <ul class="space-y-2 text-stone-700">
            <li
              v-for="script in mockScripts"
              :key="script.id"
              @click="selectScript(script.id)"
              class="cursor-pointer hover:text-ink-red hover:translate-x-1 transition-transform"
              :class="{'text-ink-red font-bold': activeScriptId === script.id}"
            >
              {{ script.title }}
            </li>
          </ul>
        </aside>

        <!-- Main Content Area -->
        <div class="md:col-span-3 flex flex-col h-[70vh]">
          
          <div v-if="activeScript" class="flex flex-col h-full">
            <!-- Tabs -->
            <div class="flex space-x-4 border-b border-stone-300 pb-2 mb-4">
               <button
                @click="currentTab = 'scenario'"
                class="px-3 py-1 font-serif text-lg transition-colors"
                :class="currentTab === 'scenario' ? 'text-ink-red font-bold border-b-2 border-ink-red' : 'text-stone-500 hover:text-ink-black'"
               >
                 {{ $t('scripts.tabs.scenario') }}
               </button>
               <button
                @click="currentTab = 'characters'"
                class="px-3 py-1 font-serif text-lg transition-colors"
                :class="currentTab === 'characters' ? 'text-ink-red font-bold border-b-2 border-ink-red' : 'text-stone-500 hover:text-ink-black'"
               >
                 {{ $t('scripts.tabs.characters') }}
               </button>
               <button
                @click="currentTab = 'tasks'"
                class="px-3 py-1 font-serif text-lg transition-colors"
                :class="currentTab === 'tasks' ? 'text-ink-red font-bold border-b-2 border-ink-red' : 'text-stone-500 hover:text-ink-black'"
               >
                 {{ $t('scripts.tabs.tasks') }}
               </button>
            </div>

            <!-- Tab Content -->
            <div class="flex-grow overflow-y-auto pr-2 custom-scrollbar relative">
                <!-- Entity Detail Overlay -->
                <div v-if="activeEntity" class="glass-panel-sm p-4 !border-ink-red/30 mb-4 relative z-10">
                     <div class="flex justify-between items-start">
                         <h3 class="text-xl text-ink-red font-bold mt-0">{{ activeEntity.name }} <span class="text-sm font-normal text-stone-500">({{ activeEntity.type }})</span></h3>
                         <button @click="activeEntityId = null" class="text-stone-400 hover:text-ink-red text-xl leading-none">&times;</button>
                     </div>
                     <MarkdownRenderer :content="activeEntity.description" @entity-click="selectEntity" />
                </div>

                <!-- Scenario Tab -->
                <div v-if="currentTab === 'scenario'">
                    <div v-for="chapter in activeScript.scenarios" :key="chapter.id" class="mb-6">
                        <h4 class="text-lg font-bold text-ink-black mb-2">{{ chapter.title }}</h4>
                        <MarkdownRenderer :content="chapter.content" @entity-click="selectEntity" />
                    </div>
                </div>

                <!-- Characters Tab -->
                <div v-else-if="currentTab === 'characters'">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div v-for="charId in activeScript.characters" :key="charId"
                             class="p-3 glass-panel-sm cursor-pointer hover:!border-ink-red/30"
                             @click="selectEntity(charId)">
                            <div class="font-bold text-ink-black">{{ mockEntities[charId]?.name }}</div>
                            <div class="text-sm text-stone-500 truncate">{{ mockEntities[charId]?.description }}</div>
                        </div>
                    </div>
                </div>

                 <!-- Tasks Tab -->
                 <div v-else-if="currentTab === 'tasks'">
                      <div class="space-y-4">
                         <div v-for="taskId in activeScript.tasks" :key="taskId"
                              class="p-3 glass-panel-sm !border-dashed cursor-pointer hover:!border-ink-red/30"
                              @click="selectEntity(taskId)">
                             <div class="flex items-center">
                                <span class="w-4 h-4 border border-ink-black mr-3 rounded-sm"></span>
                                <div class="font-bold text-ink-black">{{ mockEntities[taskId]?.name }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom: Graph Visualization -->
            <div class="mt-4 border-t border-stone-300 pt-4 h-1/3 flex-shrink-0">
                <h4 class="text-lg font-serif mb-2 text-stone-600">{{ $t('scripts.contextGraph') }}</h4>
                <div ref="graphContainer" class="w-full h-full glass-panel-sm !shadow-none overflow-hidden"></div>
            </div>

          </div>
          <div v-else class="flex items-center justify-center h-full text-stone-400 italic">
              {{ $t('scripts.noScriptSelected') }}
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { mockScripts, mockEntities, getGraphData } from '../services/mockData';
import { Graph } from '@antv/g6';
import MarkdownRenderer from '../components/MarkdownRenderer.vue';

const activeScriptId = ref<string>(mockScripts.value[0]?.id || '');
const currentTab = ref<'scenario' | 'characters' | 'tasks'>('scenario');
const activeEntityId = ref<string | null>(null);
const graphContainer = ref<HTMLElement | null>(null);
let graph: Graph | null = null;
let isRendering = false; // 添加渲染锁，防止并发渲染

const activeScript = computed(() => mockScripts.value.find(s => s.id === activeScriptId.value));
const activeEntity = computed(() => activeEntityId.value ? mockEntities.value[activeEntityId.value] : undefined);

const selectScript = (id: string) => {
    activeScriptId.value = id;
    activeEntityId.value = null;
    currentTab.value = 'scenario';
};

const selectEntity = (id: string) => {
    activeEntityId.value = id;
};

// Graph Logic (Reused primarily, could be composable)
const initGraph = () => {
  if (!graphContainer.value) return;

  graph = new Graph({
    container: graphContainer.value,
    width: graphContainer.value.clientWidth,
    height: graphContainer.value.clientHeight,
    layout: {
      type: 'force',
      preventOverlap: true,
      nodeSize: 30, // 添加 nodeSize，与节点 size 保持一致
      linkDistance: 80,
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
    node: {
      style: {
        size: 30,
        fill: '#f5f5dc',
        stroke: '#8b0000',
        lineWidth: 1.5,
        labelText: (d: any) => d.data?.label,
        labelFill: '#1a1a1a',
        labelFontSize: 10,
        labelFontFamily: 'serif',
      },
    },
    edge: {
      style: {
        stroke: '#5e2f0d',
        endArrow: true,
      },
    },
  });

  renderGraph();
};

const renderGraph = async () => {
  if (!graph || isRendering) return; // 检查渲染锁，避免并发渲染
  
  isRendering = true; // 设置渲染锁
  try {
    let data;
    if (activeEntityId.value) {
        // Focus on selected entity
        data = getGraphData(activeEntityId.value);
    } else if (activeScript.value) {
        // Show overview of script based on tab
        const nodes: any[] = [];
        const edges: any[] = [];
        const addedIds = new Set();
        
        let entitiesToShow: string[] = [];
        if (currentTab.value === 'scenario') {
            // Flatten all entities from all scenarios
             activeScript.value.scenarios.forEach(s => entitiesToShow.push(...s.relatedEntities));
        } else if (currentTab.value === 'characters') {
            entitiesToShow = activeScript.value.characters;
        } else {
            entitiesToShow = activeScript.value.tasks;
        }

        entitiesToShow.forEach(id => {
            const entityData = getGraphData(id);
            entityData.nodes.forEach(n => {
                if(!addedIds.has(n.id)) {
                    nodes.push(n);
                    addedIds.add(n.id);
                }
            });
            entityData.edges.forEach(e => edges.push(e));
        });
        data = { nodes, edges };
    } else {
        data = { nodes: [], edges: [] };
    }

    graph.setData(data);
    await graph.render(); // 使用 await 等待渲染完成
  } finally {
    isRendering = false; // 释放渲染锁
  }
};

watch([activeScriptId, activeEntityId, currentTab], () => {
    // 使用串行控制代替 setTimeout
    if (!graph && graphContainer.value) {
        initGraph();
    } else {
        renderGraph(); // renderGraph 现在是异步的，自带串行控制
    }
});

onMounted(() => {
    // 直接初始化，不需要 setTimeout
    initGraph();
});
</script>

<style scoped>
.paper-card.glass-panel-sm,
.paper-card.glass-panel-md,
.paper-card.glass-panel-lg,
.paper-card.glass-panel-dark {
  background: var(--_glass-bg, var(--glass-bg-light));
  border: 1px solid var(--_glass-border, var(--glass-border-light));
  box-shadow: var(--glass-shadow);
  border-radius: 12px;
}
</style>
