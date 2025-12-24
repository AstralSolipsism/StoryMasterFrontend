<template>
  <div
    class="rulebook-container flex flex-col overflow-hidden bg-transparent"
    style="height: calc(100vh - 140px);"
  >
    <!-- Header -->
    <header class="bg-[#2a1a10]/90 backdrop-blur-md text-stone-100 p-3 shadow-xl flex-shrink-0 z-10 border-b border-[#5e4b35] flex justify-between items-center relative">
        <div class="absolute inset-0 bg-[url('@/assets/images/wood-pattern.png')] opacity-20 pointer-events-none"></div>
        <div class="relative z-10 flex items-center pl-4">
            <div>
                <h2 class="text-2xl font-cinzel text-amber-500 tracking-wider text-shadow-sm">{{ $t('rulebook.title') }}</h2>
                <p class="text-stone-400 italic text-xs header-subtitle">{{ $t('rulebook.subtitle') }}</p>
            </div>
        </div>
    </header>

    <div class="flex-grow flex overflow-hidden relative perspective-1000">
      
      <!-- Backdrop for Sidebar (Mobile & Desktop Overlay) -->
      <div
        v-if="isSidebarOpen"
        class="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        @click="isSidebarOpen = false"
      ></div>

      <!-- Left Sidebar: Catalog Tree (Drawer style) -->
      <aside
        class="absolute top-0 left-0 z-50 h-full w-80 bg-[#1c110a] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-r border-[#5e4b35]"
        :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full']"
      >
        <div class="p-4 bg-black/40 border-b border-[#5e4b35] font-bold text-stone-300 flex justify-between items-center">
          <div class="flex items-center text-amber-600/90">
             <span class="text-xl mr-2">✦</span>
             <span class="font-cinzel tracking-wider text-sm">{{ $t('rulebook.title') }}</span>
          </div>
          <button @click="isSidebarOpen = false" class="text-stone-500 hover:text-amber-500 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
             </svg>
          </button>
        </div>
        <div class="flex-grow overflow-y-auto p-4 custom-scrollbar bg-[#1c110a]">
          <CatalogTree
            :nodes="mockCatalog"
            :activeId="activeContentId"
            @select="handleContentSelect"
          />
        </div>
      </aside>

      <!-- Center: Reading Area (The Magic Book) -->
      <main class="flex-1 relative overflow-hidden p-2 md:p-8 flex justify-center items-center">
        
        <!-- The Book Container -->
        <div
            ref="bookContainer"
            class="book-container w-full md:w-auto max-w-full md:max-w-[1200px] h-full mx-auto md:rounded-r-lg overflow-hidden flex flex-col relative shadow-2xl transition-all duration-300 transform-gpu bg-[#fdfbf7]"
            :style="{ cursor: cursorStyle }"
            @click="handleBookClick"
            @mousemove="handleMouseMove"
            @mouseleave="cursorStyle = 'auto'"
        >
          
          <!-- Bookmark Ribbon (Toggle) -->
          <div
            class="bookmark-ribbon absolute top-0 left-4 md:left-12 w-8 h-32 bg-ink-red z-40 cursor-pointer shadow-md transition-all duration-300 hover:h-36 group flex flex-col justify-end items-center pb-4"
            @click="isSidebarOpen = !isSidebarOpen"
            title="Table of Contents"
          >
             <div class="bookmark-triangle absolute bottom-0 left-0 w-0 h-0 border-l-[16px] border-r-[16px] border-b-[10px] border-l-transparent border-r-transparent border-b-[#f5f5dc] translate-y-[1px]"></div>
             <span class="text-[#f5f5dc] text-xs font-cinzel font-bold rotate-90 whitespace-nowrap opacity-80 group-hover:opacity-100 transition-opacity mb-4">M E N U</span>
          </div>

          <!-- Book Spine (Visual only, on left for desktop) -->
          <div class="absolute left-0 top-0 bottom-0 w-2 md:w-6 bg-gradient-to-r from-[#2a1a10] to-[#5e4b35] z-20 shadow-xl"></div>
          
          <!-- Background Image -->
          <div class="absolute inset-0 pointer-events-none z-10 opacity-100 bg-cover bg-center" style="background-image: url('/src/assets/images/paper-texture.jfif');"></div>
          <!-- Texture Blend (Optional, keeping slightly for grain if needed, otherwise remove or adjust opacity) -->
          <div class="absolute inset-0 pointer-events-none z-10 mix-blend-multiply opacity-20 bg-[url('@/assets/images/parchment-color.png')] bg-repeat bg-[length:300px_300px]"></div>

          <div class="flex-1 p-4 pt-16 md:p-12 md:pl-20 relative z-10 overflow-hidden flex flex-col min-h-0">
             <!-- Page Content Wrapper -->
            <div class="flex flex-col flex-1 min-h-0">
                 <!-- Breadcrumbs styled as header text -->
                <div class="text-xs text-stone-700/70 mb-4 font-serif uppercase tracking-widest border-b border-stone-800/20 pb-2 flex-shrink-0">
                   <span v-for="(crumb, index) in breadcrumbs" :key="crumb.id">
                     <span v-if="index > 0" class="mx-1 text-stone-400">/</span>
                     <span :class="{'text-ink-red font-bold': index === breadcrumbs.length - 1}">{{ crumb.title }}</span>
                   </span>
                </div>

                <div
                    ref="contentContainer"
                    class="book-columns text-ink-black leading-relaxed text-justify flex-1 min-h-0"
                    style="column-fill: auto;"
                >
                    <MarkdownRenderer
                      v-if="currentContent"
                      :content="currentContent.content"
                    />
                    
                    <div v-else class="text-center text-stone-500 py-32 italic flex flex-col items-center">
                       <span class="text-3xl mb-4 text-stone-400">❦</span>
                       {{ $t('rulebook.selectChapter') }}
                    </div>
                </div>
            </div>
             
             <!-- Corner Decorations -->
            <div class="absolute top-0 right-0 p-2 pointer-events-none opacity-40 mix-blend-multiply">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M0 0H40V40" stroke="#8b4513" stroke-width="2"/>
                </svg>
            </div>
            <div class="absolute bottom-0 right-0 p-2 pointer-events-none opacity-40 mix-blend-multiply">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M0 40H40V0" stroke="#8b4513" stroke-width="2"/>
                </svg>
            </div>
          </div>
          
        </div>

      </main>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { mockCatalog, mockChapterContent } from '../services/mockData';
import type { BookNode } from '../services/mockData';
import CatalogTree from '../components/CatalogTree.vue';
import MarkdownRenderer from '../components/MarkdownRenderer.vue';

const isSidebarOpen = ref(false); // Closed by default, accessed via Ribbon
const activeContentId = ref<string>('');
const contentContainer = ref<HTMLElement | null>(null);
const bookContainer = ref<HTMLElement | null>(null);
const cursorStyle = ref('auto');

const debugRulebook = import.meta.env.DEV;

const logRulebookState = (label: string, extra: Record<string, unknown> = {}) => {
    if (!debugRulebook) return;

    const bookEl = bookContainer.value;
    const contentEl = contentContainer.value;
    const contentStyle = contentEl ? window.getComputedStyle(contentEl) : null;

    const payload = {
        ...extra,
        book: bookEl
            ? {
                  clientWidth: bookEl.clientWidth,
                  clientHeight: bookEl.clientHeight,
              }
            : null,
        content: contentEl
            ? {
                  clientWidth: contentEl.clientWidth,
                  clientHeight: contentEl.clientHeight,
                  scrollWidth: contentEl.scrollWidth,
                  scrollHeight: contentEl.scrollHeight,
                  scrollLeft: contentEl.scrollLeft,
                  overflowX: contentStyle?.overflowX,
                  overflowY: contentStyle?.overflowY,
                  columnCount: contentStyle?.columnCount,
                  columnWidth: contentStyle?.columnWidth,
                  columnGap: contentStyle?.columnGap,
                  columnFill: contentStyle?.columnFill,
              }
            : null,
    };

    console.debug(`[Rulebook] ${label} ${JSON.stringify(payload)}`);
};

onMounted(async () => {
    await nextTick();
    logRulebookState('mounted');
});

// Interaction: Click to Turn Pages
const handleBookClick = (e: MouseEvent) => {
    // Ignore clicks on interactive elements (links, buttons, etc.) or if text is selected
    const target = e.target as HTMLElement;
    const selectedText = window.getSelection()?.toString() ?? '';
    const isInteractive = !!target.closest('a, button, .interactive-element, .bookmark-ribbon');

    if (isInteractive || selectedText) {
        logRulebookState('click ignored', {
            isInteractive,
            selectedTextLength: selectedText.length,
            target: target.tagName,
        });
        return;
    }

    if (!bookContainer.value) return;

    const rect = bookContainer.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    logRulebookState('book click', { clickX: x, bookWidth: width });

    // Left 30% area -> Previous Page
    if (x < width * 0.3) {
        prevPage();
    }
    // Right 30% area -> Next Page
    else if (x > width * 0.7) {
        nextPage();
    }
    // Center click -> Toggle UI or do nothing (currently nothing to allow text selection without jumping)
};

// Interaction: Mouse Move to hint Page Turning
const handleMouseMove = (e: MouseEvent) => {
    if (!bookContainer.value) return;
    const rect = bookContainer.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width * 0.3) {
        cursorStyle.value = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>') 16 16, pointer`;
    } else if (x > width * 0.7) {
        cursorStyle.value = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>') 16 16, pointer`;
    } else {
        cursorStyle.value = 'auto'; // Or 'text' if over text
    }
};


const getPageScrollAmount = (el: HTMLElement) => {
    const style = window.getComputedStyle(el);
    const gapValue = style.columnGap || '0';
    const gap = Number.parseFloat(gapValue);
    const columnGap = Number.isFinite(gap) ? gap : 0;

    return el.clientWidth + columnGap;
};

const nextPage = () => {
    if (!contentContainer.value) return;

    const el = contentContainer.value;
    const { clientWidth, scrollLeft, scrollWidth } = el;
    const scrollAmount = getPageScrollAmount(el);

    logRulebookState('nextPage before', { clientWidth, scrollLeft, scrollWidth, scrollAmount });

    const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);

    if (scrollLeft < maxScrollLeft - 5) {
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' });

        if (debugRulebook) {
            window.setTimeout(() => {
                logRulebookState('nextPage after', { scrollAmount });
            }, 350);
        }
    } else {
        logRulebookState('nextPage at end');
    }
};

const prevPage = () => {
    if (!contentContainer.value) return;

    const el = contentContainer.value;
    const { clientWidth, scrollLeft } = el;
    const scrollAmount = getPageScrollAmount(el);

    logRulebookState('prevPage before', { clientWidth, scrollLeft, scrollAmount });

    el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });

    if (debugRulebook) {
        window.setTimeout(() => {
            logRulebookState('prevPage after', { scrollAmount });
        }, 350);
    }
};

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

watch(currentContent, async () => {
    await nextTick();

    if (contentContainer.value) {
        contentContainer.value.scrollTo({ left: 0, behavior: 'auto' });
    }

    logRulebookState('content rendered', { activeContentId: activeContentId.value });
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

const handleContentSelect = (id: string) => {
    // Only select if it has content (is in the map)
    if (mockChapterContent.value[id]) {
        activeContentId.value = id;
        // Always close sidebar after selection for immersive reading
        isSidebarOpen.value = false;
    } else {
        // Handle expand/collapse logic if needed, but CatalogTree handles that internally mostly
        console.log("Selected node without content:", id);
    }
};

</script>

<style scoped>
.perspective-1000 {
    perspective: 1000px;
}

.book-container {
    aspect-ratio: 3 / 2;
    box-shadow:
        0 20px 50px -12px rgba(0, 0, 0, 0.5), /* Deep shadow grounded */
        0 10px 20px -5px rgba(0, 0, 0, 0.3),  /* Mid shadow */
        0 0 0 1px rgba(94, 75, 53, 0.3),      /* Border/Rim */
        inset 20px 0 50px -10px rgba(0, 0, 0, 0.15), /* Inner spine shadow */
        inset -2px 0 5px rgba(0,0,0,0.05); /* Right edge depth */
}

/* Add a subtle 3D lift on large screens */
@media (min-width: 1024px) {
    .book-container {
        transform: rotateX(1deg) scale(0.98);
        transform-origin: center bottom;
    }
}

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

.book-columns {
    column-count: 1;
    column-gap: 2rem;
    column-fill: auto;
    height: 100%;
    width: 100%;
    /* Key to horizontal scrolling pages */
    overflow-x: auto;
    overflow-y: hidden;
}

@media (min-width: 768px) {
    .book-columns {
        column-count: 2;
        column-gap: 4rem;
        column-rule: 1px solid rgba(94, 75, 53, 0.15);
    }
}

.header-subtitle {
  font-family: var(--font-serif);
}

.bookmark-ribbon {
  background: linear-gradient(to bottom, #8b0000, #a00000);
  box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
}

.bookmark-ribbon:hover {
  background: linear-gradient(to bottom, #a00000, #c00000);
}

/* Adjust bookmark triangle color to match page background */
.bookmark-triangle {
    border-bottom-color: var(--color-parchment-light); /* Fallback */
}
/* We can try to match the gradient or image, but solid color is safer for the cutout look */
</style>
