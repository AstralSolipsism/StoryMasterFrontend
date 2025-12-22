<template>
  <div class="relationship-graph-container w-full h-full bg-[#fdf6e3] relative overflow-hidden" ref="graphContainer">
    <!-- Optional: Controls overlay or loading state could go here -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-[#fdf6e3] z-10">
        <span class="text-ink-black font-cinzel animate-pulse">{{ t('characters.graph.loading') }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Graph } from '@antv/x6'
import { getGraphData } from '../../services/mockData'

export default defineComponent({
  name: 'RelationshipGraph',
  props: {
    characterId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { t } = useI18n()
    const graphContainer = ref<HTMLElement | null>(null);
    const loading = ref(true);
    let graph: Graph | null = null;

    const initGraph = () => {
        if (!graphContainer.value) return;

        graph = new Graph({
            container: graphContainer.value,
            autoResize: true,
            panning: true,
            mousewheel: true,
            grid: {
                visible: true,
                type: 'dot',
                args: { 
                    color: '#a89f91', 
                    thickness: 1 
                }
            },
            background: {
                color: '#fdf6e3' // Match parchment
            },
            connecting: {
                router: 'manhattan',
                connector: {
                    name: 'rounded',
                    args: { radius: 8 },
                },
                anchor: 'center',
                connectionPoint: 'boundary',
                snap: true,
                createEdge() {
                    return this.createEdge({
                        attrs: {
                            line: {
                                stroke: '#5e4b35', // Ink color
                                strokeWidth: 2,
                                targetMarker: 'classic',
                            },
                        },
                    })
                },
            },
        });

        renderData();
    };

    const renderData = () => {
        if (!graph) return;
        loading.value = true;
        
        try {
            const data = getGraphData(props.characterId);
            
            // Transform data for visually pleasing look
            // X6 layout or manual positioning? Since we don't have dagre installed explicitly (maybe via G6?), 
            // we'll do a simple force layout or circular layout simulation manually if needed, 
            // OR just random placement if getGraphData doesn't provide positions.
            // mockData.getGraphData returns { nodes, edges } without positions.
            
            const width = graphContainer.value?.clientWidth || 800;
            const height = graphContainer.value?.clientHeight || 600;
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(width, height) / 3;

            const x6Nodes = data.nodes.map((node: any, index: number) => {
                // Simple circular layout for now
                const angle = (index / data.nodes.length) * 2 * Math.PI;
                const x = index === 0 ? centerX : centerX + radius * Math.cos(angle);
                const y = index === 0 ? centerY : centerY + radius * Math.sin(angle);

                return {
                    id: node.id,
                    x: x - 50, // center offset
                    y: y - 20,
                    width: 100,
                    height: 40,
                    label: node.data.label,
                    attrs: {
                        body: {
                            fill: '#f5f5dc', // Parchment light
                            stroke: '#8b4513', // SaddleBrown
                            strokeWidth: 2,
                            rx: 4,
                            ry: 4,
                        },
                        label: {
                            fill: '#1a1a1a',
                            fontFamily: 'Cinzel, serif',
                            fontSize: 12,
                            fontWeight: 'bold',
                            textWrap: {
                                width: 90,
                                ellipsis: true
                            }
                        }
                    }
                };
            });

            const x6Edges = data.edges.map((edge: any) => ({
                source: edge.source,
                target: edge.target,
                label: edge.data.label,
                attrs: {
                    line: {
                        stroke: '#5e4b35',
                    },
                    text: {
                       fill: '#5e4b35',
                       fontSize: 10, 
                       textAnchor: 'middle',
                       textVerticalAnchor: 'middle'
                    }
                }
            }));

            graph.fromJSON({
                nodes: x6Nodes,
                edges: x6Edges
            });
            
            // Center content if only one node
            if(x6Nodes.length <= 1) {
                graph.centerContent();
            }

        } catch (e) {
            console.error("Graph rendering error:", e);
        } finally {
            loading.value = false;
        }
    };

    onMounted(() => {
        initGraph();
    });

    onUnmounted(() => {
        if (graph) {
            graph.dispose();
        }
    });

    watch(() => props.characterId, () => {
        renderData();
    });

    return {
        t,
        graphContainer,
        loading
    };
  }
})
</script>

<style scoped>
.font-cinzel {
    font-family: 'Cinzel', serif;
}
</style>