<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="glass-panel-sm glass-panel-dark text-[#f0e6d2] p-4 z-10">
      <h1 class="text-2xl font-serif font-bold">{{ $t('dm.title') }}</h1>
      <p class="text-sm opacity-80">{{ $t('dm.subtitle') }}</p>
    </div>

    <div class="flex-1 flex overflow-hidden">
      <!-- Main Canvas (Workflow Graph) -->
      <div class="flex-1 relative" ref="graphContainer">
        <!-- Legend -->
        <div class="absolute top-4 left-4 glass-panel-sm p-3 text-xs z-10 pointer-events-none">
          <h3 class="font-bold mb-2 text-[#2c1810]">{{ $t('dm.legend') }}</h3>
          <div class="flex items-center mb-1"><span class="w-3 h-3 rounded-full bg-[#7c3aed] mr-2"></span> {{ $t('dm.narrator') }}</div>
          <div class="flex items-center mb-1"><span class="w-3 h-3 rounded-full bg-[#2563eb] mr-2"></span> {{ $t('dm.logic') }}</div>
          <div class="flex items-center mb-1"><span class="w-3 h-3 rounded-full bg-[#4b5563] mr-2"></span> {{ $t('dm.system') }}</div>
          <div class="flex items-center"><span class="w-3 h-3 rounded-full bg-[#16a34a] mr-2"></span> {{ $t('dm.npc') }}</div>
        </div>
      </div>

      <!-- Configuration Panel (Sidebar) -->
      <div
        class="w-1/3 glass-panel-md p-6 overflow-y-auto flex flex-col"
        style="border-left: 4px solid #8b4513;"
        v-if="selectedAgent"
      >
        <div class="border-b-2 border-[#8b4513] pb-4 mb-6">
          <h2 class="text-3xl font-serif font-bold text-[#2c1810]">{{ selectedAgent.name }}</h2>
          <span
            class="inline-block px-3 py-1 mt-2 text-xs font-bold uppercase tracking-wider rounded-full text-white"
            :class="typeColor(selectedAgent.type)"
          >
            {{ selectedAgent.type }} {{ $t('dm.agent') }}
          </span>
        </div>

        <div class="space-y-6 flex-1">
          <!-- Model Config -->
          <div>
            <label class="block text-[#5c3a21] font-bold mb-1 uppercase text-xs">{{ $t('dm.model') }}</label>
            <select v-model="selectedAgent.config.model" class="w-full bg-[#fdf6e3] border border-[#8b4513] rounded p-2 text-[#2c1810] focus:ring-2 focus:ring-[#8b4513] outline-none font-mono text-sm">
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
            </select>
          </div>

          <!-- Temperature -->
          <div>
            <label class="block text-[#5c3a21] font-bold mb-1 uppercase text-xs flex justify-between">
              <span>{{ $t('dm.creativity') }}</span>
              <span>{{ selectedAgent.config.temperature }}</span>
            </label>
            <input
              type="range"
              min="0" 
              max="1" 
              step="0.1" 
              v-model.number="selectedAgent.config.temperature"
              class="w-full accent-[#8b4513]"
            >
          </div>

          <!-- Prompt Template -->
          <div>
            <label class="block text-[#5c3a21] font-bold mb-1 uppercase text-xs">{{ $t('dm.systemPrompt') }}</label>
            <textarea
              v-model="selectedAgent.config.promptTemplate"
              class="w-full h-32 bg-[#fdf6e3] border border-[#8b4513] rounded p-2 text-[#2c1810] focus:ring-2 focus:ring-[#8b4513] outline-none font-mono text-xs leading-relaxed resize-y"
            ></textarea>
          </div>

          <!-- Rules -->
          <div>
            <label class="block text-[#5c3a21] font-bold mb-1 uppercase text-xs">{{ $t('dm.directives') }}</label>
            <div class="bg-[#fdf6e3] border border-[#8b4513] rounded p-2">
              <div
                v-for="(rule, index) in selectedAgent.config.rules"
                :key="index"
                class="flex items-center justify-between mb-2 text-sm text-[#2c1810] border-b border-[#e6dcc3] pb-1 last:border-0 last:pb-0"
              >
                <span>• {{ rule }}</span>
                <button @click="removeRule(index)" class="text-red-800 hover:text-red-600 font-bold ml-2">×</button>
              </div>
              <div class="flex mt-2">
                <input
                  v-model="newRule"
                  @keyup.enter="addRule"
                  :placeholder="$t('dm.addRule')"
                  class="flex-1 bg-transparent border-b border-[#8b4513] outline-none text-sm px-1"
                >
                <button @click="addRule" class="text-[#8b4513] font-bold hover:underline ml-2 text-xs uppercase">{{ $t('dm.add') }}</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-6 pt-4 border-t border-[#8b4513]">
          <button class="w-full bg-[#2c1810] text-[#f0e6d2] py-3 font-serif font-bold hover:bg-[#3e2b20] transition-colors shadow-lg border-2 border-[#8b4513]">
            {{ $t('dm.updateConfig') }}
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="w-1/3 flex items-center justify-center glass-panel-sm text-[#5c3a21] italic font-serif p-8 text-center" style="border-left: 4px solid #8b4513;">
        {{ $t('dm.noAgentSelected') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import { Graph } from '@antv/g6';
import { getAgentWorkflowData, type Agent, mockAgents } from '../services/mockData';

export default defineComponent({
  name: 'DMView',
  setup() {
    const graphContainer = ref<HTMLElement | null>(null);
    const selectedAgent = ref<Agent | null>(null);
    const newRule = ref('');
    let graph: Graph | null = null;

    const typeColor = (type: string) => {
      switch (type) {
        case 'narrator': return 'bg-[#7c3aed]';
        case 'logic': return 'bg-[#2563eb]';
        case 'system': return 'bg-[#4b5563]';
        case 'npc': return 'bg-[#16a34a]';
        default: return 'bg-gray-500';
      }
    };

    const getNodeColor = (type: string) => {
       switch (type) {
        case 'narrator': return '#7c3aed';
        case 'logic': return '#2563eb';
        case 'system': return '#4b5563';
        case 'npc': return '#16a34a';
        default: return '#666';
      }
    };

    const initGraph = async () => {
      if (!graphContainer.value) return;

      const { nodes, edges } = getAgentWorkflowData();
      const width = graphContainer.value.clientWidth;
      const height = graphContainer.value.clientHeight;

      graph = new Graph({
        container: graphContainer.value,
        width,
        height,
        layout: {
          type: 'dagre',
          rankdir: 'LR',
          align: 'DL',
          nodesep: 50,
          ranksep: 100,
        },
        behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
        node: {
          type: 'rect',
          style: {
            size: [160, 60],
            radius: 8,
            stroke: '#2c1810',
            lineWidth: 2,
            shadowColor: 'rgba(0,0,0,0.3)',
            shadowBlur: 10,
            labelText: (d: any) => d.data?.label || d.id,
            labelFill: '#fff',
            labelFontSize: 14,
            labelFontWeight: 600,
          },
        },
        edge: {
          type: 'polyline',
          style: {
            stroke: '#8b4513',
            lineWidth: 2,
            endArrow: true,
            endArrowOffset: 10,
            labelText: 'flows to',
            labelFill: '#5c3a21',
            labelFontSize: 10,
            labelBackground: true,
            labelBackgroundFill: '#fdf6e3',
            labelPadding: [2, 4],
            labelBackgroundRadius: 2,
          },
        },
      });

      const processedNodes = nodes.map(node => ({
        ...node,
        style: {
          fill: getNodeColor(node.data.type),
        }
      }));

      graph.setData({ nodes: processedNodes, edges });
      await graph.render();
      graph.fitView();

      graph.on('node:click', (e: any) => {
        const nodeId = e.target.id;
        if (graph) {
          const nodeData = graph.getNodeData(nodeId);
          // Create a deep copy to avoid direct mutation issues before saving
          if (nodeData?.data?.agent) {
            selectedAgent.value = JSON.parse(JSON.stringify(nodeData.data.agent));
          }
        }
      });
      
      graph.on('canvas:click', () => {
        // Optional: deselect if clicking background
        // selectedAgent.value = null;
      });
    };

    const addRule = () => {
      if (newRule.value.trim() && selectedAgent.value) {
        selectedAgent.value.config.rules.push(newRule.value.trim());
        newRule.value = '';
      }
    };

    const removeRule = (index: number) => {
      if (selectedAgent.value) {
        selectedAgent.value.config.rules.splice(index, 1);
      }
    };

    onMounted(() => {
      initGraph();
      window.addEventListener('resize', () => {
        if (graph && graphContainer.value) {
          graph.resize(graphContainer.value.clientWidth, graphContainer.value.clientHeight);
        }
      });
    });

    watch(mockAgents, () => {
        if (graph) {
            graph.destroy();
            graph = null;
        }
        initGraph();
    });

    return {
      graphContainer,
      selectedAgent,
      typeColor,
      newRule,
      addRule,
      removeRule
    };
  },
});
</script>
