<template>
  <div
    class="rulebook-container flex flex-col bg-stone-100 overflow-hidden"
    style="height: calc(100vh - 140px);"
  >
    <!-- Header -->
    <header class="bg-ink-red text-stone-100 p-4 shadow-lg flex-shrink-0 z-10">
      <h2 class="text-3xl font-serif tracking-in-expand">{{ $t('rulebook.title') }}</h2>
      <p class="text-stone-300 italic text-sm">{{ $t('rulebook.subtitle') }}</p>
    </header>

    <div class="flex-grow flex overflow-hidden">
      <!-- Left Sidebar: Catalog Tree -->
      <aside 
        class="w-72 bg-stone-50 border-r-2 border-stone-300 flex flex-col transition-all duration-300 ease-in-out"
        :class="{ '-ml-72': !isSidebarOpen }"
        style="box-shadow: 2px 0 5px rgba(0,0,0,0.05);"
      >
        <div class="p-3 bg-stone-200 border-b border-stone-300 font-bold text-stone-700 flex justify-between items-center">
          <span>{{ $t('rulebook.chapters') }}</span>
          <button @click="isSidebarOpen = false" class="md:hidden text-stone-500 hover:text-ink-red">✕</button>
        </div>
        <div class="flex-grow overflow-y-auto p-2 custom-scrollbar">
          <CatalogTree 
            :nodes="mockCatalog" 
            :activeId="activeContentId" 
            @select="handleContentSelect" 
          />
        </div>
      </aside>

      <!-- Toggle Sidebar Button (Visible when closed) -->
      <button 
        v-if="!isSidebarOpen"
        @click="isSidebarOpen = true"
        class="absolute left-0 top-20 z-20 bg-ink-red text-white p-2 rounded-r shadow-md hover:bg-red-800 transition-colors"
      >
        MENU
      </button>

      <!-- Center: Reading Area -->
      <main class="flex-1 relative overflow-y-auto bg-stone-100 p-4 md:p-8 custom-scrollbar">
        <div class="max-w-4xl mx-auto bg-white min-h-full shadow-2xl rounded-sm p-8 md:p-12 relative print-paper">
          <!-- Paper Texture Effect Overlay -->
          <div class="absolute inset-0 pointer-events-none bg-paper-texture opacity-50 rounded-sm"></div>
          
          <div class="relative z-10">
            <!-- Breadcrumbs -->
            <div class="text-sm text-stone-500 mb-6 font-serif">
               <span v-for="(crumb, index) in breadcrumbs" :key="crumb.id">
                 <span v-if="index > 0"> > </span>
                 <span :class="{'font-bold text-stone-700': index === breadcrumbs.length - 1}">{{ crumb.title }}</span>
               </span>
            </div>

            <MarkdownRenderer 
              v-if="currentContent" 
              :content="currentContent.content" 
              @entity-click="handleEntityClick" 
            />
            
            <div v-else class="text-center text-stone-500 py-20 italic">
              {{ $t('rulebook.selectChapter') }}
            </div>
          </div>
        </div>
      </main>

      <!-- Right Sidebar: Entity Details -->
      <aside 
        class="w-80 bg-stone-50 border-l border-stone-300 shadow-xl transform transition-transform duration-300 fixed md:relative right-0 h-full z-20 flex flex-col"
        :class="{'translate-x-full md:translate-x-0 md:w-0 md:border-none': !activeEntity, 'translate-x-0 md:w-80': activeEntity}"
      >
        <div class="p-4 bg-stone-200 border-b border-stone-300 flex justify-between items-center">
            <h3 class="font-bold text-ink-black">{{ $t('rulebook.entityDetails') }}</h3>
            <button @click="activeEntityId = null" class="text-stone-500 hover:text-ink-red text-xl">×</button>
        </div>

        <div v-if="activeEntity" class="flex-grow overflow-y-auto p-4 custom-scrollbar">
            <h4
                class="text-xl font-serif text-ink-red mb-1 cursor-pointer hover:underline"
                @click="jumpToEntityInChapter"
                title="Jump to mention in book"
            >
                {{ activeEntity.name }} 🔗
            </h4>
            <div class="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4 border-b border-stone-300 pb-2">
                {{ activeEntity.type }}
            </div>
            
            <MarkdownRenderer :content="activeEntity.description" @entity-click="handleEntityClick" />

            <!-- Relationships / Graph Info -->
            <div class="mt-8 pt-4 border-t border-stone-300">
                 <h5 class="font-bold text-stone-700 mb-2">{{ $t('rulebook.related') }}</h5>
                 <ul class="space-y-1">
                     <li v-for="rel in activeEntity.relations" :key="rel.targetId" class="text-sm">
                         <span class="text-stone-600">{{ rel.type }}: </span>
                         <button @click="handleEntityClick(rel.targetId)" class="text-ink-red hover:underline font-medium">
                             {{ getEntityName(rel.targetId) }}
                         </button>
                     </li>
                 </ul>
            </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { mockCatalog, mockChapterContent, mockEntities } from '../services/mockData';
import type { BookNode } from '../services/mockData';
import CatalogTree from '../components/CatalogTree.vue';
import MarkdownRenderer from '../components/MarkdownRenderer.vue';

const isSidebarOpen = ref(true);
const activeContentId = ref<string>('');
const activeEntityId = ref<string | null>(null);

// Initialize with the first chapter if available
const initSelection = () => {
    if (mockCatalog.value.length > 0) {
        const firstRoot = mockCatalog.value[0];
        if (firstRoot && firstRoot.children && firstRoot.children.length > 0) {
            // Prefer first child (e.g., a specific section)
            const firstChild = firstRoot.children[0];
            if (firstChild) {
                // If child has children, drill down? For now simple
                if (firstChild.children && firstChild.children.length > 0 && firstChild.children[0]) {
                     activeContentId.value = firstChild.children[0].id;
                } else {
                     activeContentId.value = firstChild.id;
                }
            } else {
                activeContentId.value = firstRoot.id;
            }
        } else if (firstRoot) {
            activeContentId.value = firstRoot.id;
        }
    }
};
initSelection();

// Re-init if locale changes
watch(mockCatalog, () => {
    if (!activeContentId.value || !mockChapterContent.value[activeContentId.value]) {
        initSelection();
    }
});

const currentContent = computed(() => {
    return mockChapterContent.value[activeContentId.value];
});

const activeEntity = computed(() => {
   if (!activeEntityId.value) return null;
   return mockEntities.value[activeEntityId.value];
});

// Helper to get breadcrumbs
const breadcrumbs = computed(() => {
    const crumbs: {id: string, title: string}[] = [];
    let current = currentContent.value;
    
    while (current) {
        crumbs.unshift({ id: current.id, title: current.title });
        if (current.parentId) {
            // Find parent in the tree? Or in the content map?
            // The content map stores ChapterContent which extends BookNode, so it has parentId
            // But verify if parent is in content Map. The tree structure is in mockCatalog.
            // Simplified approach: Look up parent in content map first, if not found, 
            // we have to search the tree (which is slower but accurate).
            // For this mock data, parents like "phb" might NOT be in mockChapterContent if they don't have text content.
            
            // Let's rely on recursive search in tree if needed, or just partial crumbs if mapped.
            // For now, let's assume all displayable nodes are in mockChapterContent or we search the tree.
            
            const parentInMap = mockChapterContent.value[current.parentId];
            if (parentInMap) {
                current = parentInMap;
            } else {
                // If parent not in content map (e.g. just a structural folder), try to find name from tree
                const parentNode = findNodeById(mockCatalog.value, current.parentId);
                if (parentNode) {
                   // Create a pseudo content object for the loop
                   // Cast to any to satisfy the loop variable type check temporarily or refactor loop
                   current = { ...parentNode, content: '', order: 0, relatedEntities: [] } as any; 
                } else {
                   break;
                }
            }
        } else {
            break;
        }
    }
    return crumbs;
});

const findNodeById = (nodes: BookNode[], id: string): BookNode | undefined => {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return undefined;
};

const getEntityName = (id: string) => {
    return mockEntities.value[id]?.name || id;
};

const handleContentSelect = (id: string) => {
    // Only select if it has content (is in the map)
    if (mockChapterContent.value[id]) {
        activeContentId.value = id;
        // On mobile, close sidebar after selection
        if (window.innerWidth < 768) {
            isSidebarOpen.value = false;
        }
    } else {
        // Handle expand/collapse logic if needed, but CatalogTree handles that internally mostly
        console.log("Selected node without content:", id);
    }
};

const handleEntityClick = (entityId: string) => {
    activeEntityId.value = entityId;
};

const jumpToEntityInChapter = async () => {
    if (!activeEntityId.value) return;
    const entityId = activeEntityId.value;

    // 1. Find the chapter containing this entity
    // We check the relatedEntities array in ChapterContent
    let foundChapterId = Object.keys(mockChapterContent.value).find(chapterId => {
        const chapter = mockChapterContent.value[chapterId];
        return chapter && chapter.relatedEntities && chapter.relatedEntities.includes(entityId);
    });

    // Fallback: If not explicitly related, simple text search in content?
    // (Optional, based on user requirements "ensure data contains... OR traverse finding")
    if (!foundChapterId) {
        foundChapterId = Object.keys(mockChapterContent.value).find(chapterId => {
            const chapter = mockChapterContent.value[chapterId];
            return chapter && chapter.content && (
                chapter.content.includes(`[${entityId}]`) ||
                chapter.content.includes(`(${entityId})`)
            );
        });
    }

    if (foundChapterId) {
        activeContentId.value = foundChapterId;
        
        // 2. Wait for render
        await nextTick();

        // 3. Find element and scroll
        // The MarkdownRenderer creates spans: <span ... data-entity-id="entityId">
        const selector = `span[data-entity-id="${entityId}"]`;
        const element = document.querySelector(selector);
        
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a temporary highlight class
            element.classList.add('bg-yellow-200', 'transition-colors', 'duration-1000');
            setTimeout(() => {
                element.classList.remove('bg-yellow-200');
            }, 2000);
        }
    } else {
        console.warn(`Entity ${entityId} not found in any chapter related lists.`);
    }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(120, 53, 15, 0.3);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(120, 53, 15, 0.5);
}

.bg-paper-texture {
  background-color: #fdfbf7;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
}

.print-paper {
    box-shadow: 
        0 1px 1px rgba(0,0,0,0.15), 
        0 10px 0 -5px #eee, 
        0 10px 1px -4px rgba(0,0,0,0.15), 
        0 20px 0 -10px #eee, 
        0 20px 1px -9px rgba(0,0,0,0.15);
}
</style>
