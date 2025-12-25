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
        </div></div>
    </header>

    <!-- 宽屏三栏布局容器 -->
    <div
      class="flex-grow relative perspective-1000 overflow-y-hidden"
      :class="isWideLayout ? 'widescreen-grid overflow-x-visible' : 'flex overflow-hidden'"
    >
      <!-- 窄屏模式：Backdrop for Sidebar (Mobile & Desktop Overlay) -->
      <div
        v-if="!isWideLayout && isSidebarOpen"
        class="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        @click="isSidebarOpen = false"></div>

      <!-- 窄屏模式：Left Sidebar: Catalog Tree (Drawer style) -->
      <aside
        v-if="!isWideLayout"
        class="absolute top-0 left-0 z-50 h-full w-80 bg-[#1c110a] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-r border-[#5e4b35]"
        :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full']"
      >
        <div class="p-4 bg-black/40 border-b border-[#5e4b35] font-bold text-stone-300flex justify-between items-center">
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
            :nodes="catalogNodes"
            :activeId="activeContentId"
            @select="handleContentSelect"
          />
        </div>
      </aside>

      <!-- 宽屏模式：左侧卷轴目录 -->
      <Transition name="fade-slide-left">
        <aside
          v-if="showWidePanels"
          class="widescreen-left-panel h-full overflow-hidden flex flex-col p-4">
          <ScrollableCatalogWrapper
            :nodes="catalogNodes"
            :activeId="activeContentId"
            :title="$t('rulebook.title')"
            :height="'calc(100% - 16px)'"
            @select="handleContentSelect"
          />
        </aside>
      </Transition>

      <!-- Center: Reading Area (The Magic Book) -->
      <main class="widescreen-center-panel relative overflow-hidden p-2 md:p-8 flex justify-center items-center">
        <!-- The Book Container -->
        <div
          ref="bookContainer"
          class="book-container w-full md:w-auto max-w-full md:max-w-[1200px] h-full mx-auto md:rounded-r-lg overflow-hidden flex flex-col relative shadow-2xl transition-all duration-300 transform-gpu bg-[#fdfbf7]"
          :style="{ cursor: cursorStyle }"
          @click="handleBookClick"
          @mousemove="handleMouseMove"
          @mouseleave="cursorStyle = 'auto'"
        >
          <!-- Bookmark Ribbon (Toggle) - 仅在窄屏模式下显示 -->
          <div
            v-if="!isWideLayout"
            class="bookmark-ribbon absolute top-0 left-4 md:left-12 w-8 h-32 bg-ink-red z-40 cursor-pointer shadow-md transition-all duration-300 hover:h-36 group flex flex-col justify-end items-center pb-4"
            @click.stop="isSidebarOpen = !isSidebarOpen"
            title="Table of Contents"
          >
            <div class="bookmark-triangle absolute bottom-0 left-0 w-0 h-0 border-l-[16px] border-r-[16px] border-b-[10px] border-l-transparent border-r-transparent border-b-[#f5f5dc] translate-y-[1px]"></div>
            <span class="text-[#f5f5dc] text-xs font-cinzel font-bold rotate-90whitespace-nowrap opacity-80 group-hover:opacity-100 transition-opacity mb-4">M E N U</span>
          </div>

          <!-- Book Spine (Visual only, on left for desktop) -->
          <div class="absolute left-0 top-0 bottom-0 w-2 md:w-6 bg-gradient-to-r from-[#2a1a10] to-[#5e4b35] z-20 shadow-xl"></div>
          
          <!-- Background Image -->
          <div class="absolute inset-0 pointer-events-none z-10 opacity-100 bg-cover bg-center" style="background-image: url('/src/assets/images/paper-texture.jfif');"></div>
          <!-- Texture Blend -->
          <div class="absolute inset-0 pointer-events-none z-10 mix-blend-multiply opacity-20 bg-[url('@/assets/images/parchment-color.png')] bg-repeat bg-[length:300px_300px]"></div><div class="flex-1 p-4 pt-16 md:p-12 md:pl-20 relative z-10 overflow-hidden flex flex-col min-h-0">
            <!-- Page Content Wrapper -->
            <div class="flex flex-col flex-1 min-h-0">
              <!-- Breadcrumbs styled as header text -->
              <div class="text-xs text-stone-700/70 mb-4 font-serif uppercase tracking-widest border-b border-stone-800/20 pb-2 flex-shrink-0">
                <span v-for="(crumb, index) in breadcrumbs" :key="crumb.id"><span v-if="index > 0" class="mx-1 text-stone-400">/</span>
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
                <path d="M0 0H40V40" stroke="#8b4513" stroke-width="2"/></svg>
            </div>
            <div class="absolute bottom-0 right-0 p-2 pointer-events-none opacity-40 mix-blend-multiply">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M0 40H40V0" stroke="#8b4513" stroke-width="2"/>
              </svg>
            </div></div>
        </div>
      </main>

      <!-- 宽屏模式：右侧散落区域 -->
      <Transition name="fade-slide-right">
        <aside
          v-if="showWidePanels"
          class="widescreen-right-panel h-full overflow-hidden"
        >
          <DeskScatterLayout
            :showToc="showRightToc"
            :tocTitle="currentContent?.title || '章节大纲'"
            :headings="currentHeadings"
            :entities="currentEntities"
            :columns="1"
            :enableRotation="true"
            :maxRotation="3"
            @toc-select="handleTocSelect"
            @entity-click="handleEntityClick"
          />
        </aside>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { mockCatalog, mockChapterContent, mockEntities } from '../services/mockData';
import type { BookNode, ChapterContent, Entity } from '../services/mockData';
import { loadCatalog, loadChapterContent } from '../services/rulebookDataService';
import CatalogTree from '../components/CatalogTree.vue';
import MarkdownRenderer from '../components/MarkdownRenderer.vue';
import { ScrollableCatalogWrapper, DeskScatterLayout } from '../components/rulebook-desk-items';
import type { TocHeading } from '../components/rulebook-desk-items';

// ==========宽屏检测 ==========
/**宽屏断点阈值（像素） */
const WIDESCREEN_BREAKPOINT = 1920;

/**
 * 宽屏左右侧栏过渡时长（毫秒）
 * - 需要与 CSS 中的 `fade-slide-*` 动画时长保持一致
 */
const PANEL_TRANSITION_MS = 420;

/**
 * 媒体查询目标状态：是否为宽屏
 * - 仅代表“浏览器当前宽度是否满足断点”
 */
const isWideScreen = ref(false);

/**
 * 当前布局状态：是否采用三栏 grid
 * - 为避免跨断点瞬间从 grid -> flex 产生跳变，离场动画期间会短暂保持为 true
 */
const isWideLayout = ref(false);

/**
 * 是否渲染宽屏左右侧栏
 * - 通过 v-if + Transition 控制左右侧栏出现/消失动画
 */
const showWidePanels = ref(false);

/**宽屏检测媒体查询 */
let mediaQuery: MediaQueryList | null = null;

/** 延迟切换布局的定时器（用于让侧栏离场动画完成后再切换布局） */
let wideLayoutTimer: number | null = null;

/**
 * 应用屏幕模式变更（处理过渡，避免跳变）
 */
const applyWideMode = async (matches: boolean) => {
  isWideScreen.value = matches;

  if (wideLayoutTimer !== null) {
    window.clearTimeout(wideLayoutTimer);
    wideLayoutTimer = null;
  }

  // 进入宽屏：先切换到 grid，再挂载左右侧栏，避免首次渲染出现“卡一下”
  if (matches) {
    isWideLayout.value = true;
    isSidebarOpen.value = false;
    await nextTick();
    showWidePanels.value = true;
    return;
  }

  // 退出宽屏：先卸载侧栏触发离场动画，动画结束后再切回 flex
  showWidePanels.value = false;
  wideLayoutTimer = window.setTimeout(() => {
    isWideLayout.value = false;
    wideLayoutTimer = null;
  }, PANEL_TRANSITION_MS);
};

/**
 * 媒体查询变化处理函数
 */
const handleMediaQueryChange = (e: MediaQueryListEvent | MediaQueryList) => {
  void applyWideMode(e.matches);
};

//初始化和清理媒体查询监听
onMounted(() => {
  mediaQuery = window.matchMedia(`(min-width: ${WIDESCREEN_BREAKPOINT}px)`);
  void applyWideMode(mediaQuery.matches);
  mediaQuery.addEventListener('change', handleMediaQueryChange);
});

onUnmounted(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', handleMediaQueryChange);
  }
  if (wideLayoutTimer !== null) {
    window.clearTimeout(wideLayoutTimer);
  }
});

// ========== 原有状态 ==========
const isSidebarOpen = ref(false); // 默认关闭，通过书签打开
const activeContentId = ref<string>('');
const contentContainer = ref<HTMLElement | null>(null);
const bookContainer = ref<HTMLElement | null>(null);
const cursorStyle = ref('auto');

/** 当前目录树（优先真实数据，失败时回退到 mock） */
const catalogNodes = ref<BookNode[]>([]);
/** 运行时加载到的真实章节内容（按需加载，避免一次性拉取全部 JSON） */
const runtimeChapterContentMap = ref<Record<string, ChapterContent>>({});
/** 是否正在使用 mock 目录回退（用于语言切换时同步刷新目录） */
const isMockCatalogFallback = ref(false);

const getContentById = (id: string): ChapterContent | undefined => {
  if (!id) return undefined;
  return runtimeChapterContentMap.value[id] ?? mockChapterContent.value[id];
};

const debugRulebook = import.meta.env.DEV;

const logRulebookState = (label: string, extra: Record<string, unknown> = {}) => {
  if (!debugRulebook) return;

  const bookEl = bookContainer.value;
  const contentEl = contentContainer.value;
  const contentStyle = contentEl ? window.getComputedStyle(contentEl) : null;

  const payload = {
    ...extra,
    book: bookEl? {
          clientWidth: bookEl.clientWidth,
          clientHeight: bookEl.clientHeight,}
      : null,
    content: contentEl
      ? {
          clientWidth: contentEl.clientWidth,
          clientHeight: contentEl.clientHeight,
          scrollWidth: contentEl.scrollWidth,
          scrollHeight: contentEl.scrollHeight,scrollLeft: contentEl.scrollLeft,
          overflowX: contentStyle?.overflowX,
          overflowY: contentStyle?.overflowY,
          columnCount: contentStyle?.columnCount,
          columnWidth: contentStyle?.columnWidth,
          columnGap: contentStyle?.columnGap,
          columnFill: contentStyle?.columnFill,}
      : null,
  };

  console.debug(`[Rulebook] ${label} ${JSON.stringify(payload)}`);
};

onMounted(async () => {
  await nextTick();
  logRulebookState('mounted');

  // 组件挂载后加载真实目录（失败则回退到 mock）
  try {
    const catalogRoot = await loadCatalog();
    catalogNodes.value = [catalogRoot];
    isMockCatalogFallback.value = false;
  } catch (e) {
    console.warn('[Rulebook] loadCatalog 失败，回退到 mock 目录', e);
    catalogNodes.value = mockCatalog.value;
    isMockCatalogFallback.value = true;
  }

  // 初始化默认选中项，并按需加载对应章节内容
  if (!activeContentId.value || !getContentById(activeContentId.value)) {
    initSelection();
  }

  if (activeContentId.value) {
    await handleContentSelect(activeContentId.value);
  }
});

// ========== 翻页交互 ==========
// 点击翻页
const handleBookClick = (e: MouseEvent) => {
  //忽略交互元素上的点击，或者已选中文本
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

  // 左侧 30% 区域 -> 上一页
  if (x< width * 0.3) {
    prevPage();
  }
  // 右侧 30% 区域 -> 下一页
  else if (x > width * 0.7) {
    nextPage();
  }
  // 中间区域不处理，允许文本选择
};

// 鼠标移动提示翻页方向
const handleMouseMove = (e: MouseEvent) => {
  if (!bookContainer.value) return;
  const rect = bookContainer.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const width = rect.width;

  if (x < width * 0.3) {
    cursorStyle.value = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 17l-5-55-5M18 17l-5-5 5-5"/></svg>') 1616, pointer`;
  } else if (x > width * 0.7) {
    cursorStyle.value = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>') 16 16, pointer`;
  } else {
    cursorStyle.value = 'auto';
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

  if (scrollLeft < maxScrollLeft -5) {
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

// ========== 内容选择逻辑 ==========
// 初始化选择第一个章节
const initSelection = () => {
  const root = catalogNodes.value[0];
  if (!root) return;

  // 优先跳过 book 根节点，选择第一个可阅读的子节点
  let current: BookNode = root;
  if (current.type === 'book') {
    const firstChild: BookNode | undefined = current.children?.[0];
    if (!firstChild) return;
    current = firstChild;
  }

  // 兼容深层目录：一路取第一个子节点直到叶子
  while (current.children && current.children.length > 0) {
    const nextNode: BookNode | undefined = current.children[0];
    if (!nextNode) break;
    current = nextNode;
  }

  activeContentId.value = current.id;
};

// 语言变化时：仅在使用 mock 回退时同步目录与选中项
watch(mockCatalog, () => {
  if (!isMockCatalogFallback.value) return;

  catalogNodes.value = mockCatalog.value;
  if (!activeContentId.value || !getContentById(activeContentId.value)) {
    initSelection();
  }
});

const currentContent = computed(() => {
  return getContentById(activeContentId.value);
});

watch(currentContent, async () => {
  await nextTick();

  if (contentContainer.value) {
    contentContainer.value.scrollTo({ left: 0, behavior: 'auto' });
  }

  logRulebookState('content rendered', { activeContentId: activeContentId.value });
});

// 面包屑导航
const breadcrumbs = computed(() => {
  const crumbs: { id: string; title: string }[] = [];
  let current = currentContent.value;
  while (current) {
    crumbs.unshift({ id: current.id, title: current.title });
    if (current.parentId) {
      const parentInMap = getContentById(current.parentId);
      if (parentInMap) {
        current = parentInMap;
      } else {
        const parentNode = findNodeById(catalogNodes.value, current.parentId);
        if (parentNode) {
          current = { ...parentNode, content: '', order: 0, relatedEntities: [] } as ChapterContent;
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

const handleContentSelect = async (id: string) => {
  if (!id) return;
  activeContentId.value = id;
  // 选择后关闭侧边栏
  isSidebarOpen.value = false;
 
  // 已经有内容（真实或 mock）则无需重复加载
  if (getContentById(id)) return;
 
  try {
    const content = await loadChapterContent(id);
    if (content) {
      runtimeChapterContentMap.value[id] = content;
      return;
    }
  } catch (e) {
    console.warn('[Rulebook] loadChapterContent 失败，回退到 mock 内容', { id, e });
  }
 
  // 真实内容未包含且 mock 也没有：给出可读的提示信息（避免空白）
  const node = findNodeById(catalogNodes.value, id);
  const title = node?.title || id;
 
  runtimeChapterContentMap.value[id] = {
    id,
    title,
    type: node?.type ?? 'section',
    parentId: node?.parentId,
    pageStart: node?.pageStart,
    pageEnd: node?.pageEnd,
    order: 0,
    relatedEntities: [],
    content: `# ${title}
 
未找到该章节的内容数据（可能尚未复制到前端 public 目录）。
 
- chapterId: ${id}
- 期望路径: /data/chapters/${id}.json
 
请将对应 JSON 文件复制到 dnd-ai-frontend/public/data/chapters/ 目录后重试。`,
  };
};

// ========== 宽屏模式：右侧散落区数据 ==========
/** 是否显示右侧目录大纲 */
const showRightToc = computed(() => {
  return !!currentContent.value;
});

/**
 * 从Markdown 内容中提取标题
 */
const extractHeadingsFromMarkdown = (markdown: string): TocHeading[] => {
  const headings: TocHeading[] = [];
  const lines = markdown.split('\n');
 
  // 与 MarkdownRenderer 中的 markdown-it-anchor slugify 保持一致
  const slugify = (s: string) => s.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');
  const slugCounts: Record<string, number> = {};
  const uniqueSlugStartIndex = 1;
 
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match || !match[1] || !match[2]) continue;
 
    const level = match[1].length;
    const text = match[2].trim();
 
    const base = slugify(text) || 'section';
    const seen = slugCounts[base] ?? 0;
    const id = seen === 0 ? base : `${base}-${seen - 1 + uniqueSlugStartIndex}`;
    slugCounts[base] = seen + 1;
 
    headings.push({ level, text, id });
  }
 
  return headings;
};

/** 当前章节的标题列表 */
const currentHeadings = computed((): TocHeading[] => {
  if (!currentContent.value?.content) {
    return [];
  }
  return extractHeadingsFromMarkdown(currentContent.value.content);
});

/** 当前章节的关联实体列表 */
const currentEntities = computed((): Entity[] => {
  if (!currentContent.value?.relatedEntities) {
    return [];
  }
  
  const entities: Entity[] = [];
  for (const entityId of currentContent.value.relatedEntities) {
    const entity = mockEntities.value[entityId];
    if (entity) {
      entities.push(entity);
    }
  }
  return entities;
});

/**
 * 处理目录大纲点击 - 滚动到对应标题
 */
const handleTocSelect = (heading: TocHeading) => {
  if (!heading.id || !contentContainer.value) return;
 
  // 使用属性选择器，避免 ID 以数字开头导致 `#id` 选择器失效
  const headingEl = contentContainer.value.querySelector(`[id="${heading.id}"]`);
  if (headingEl) {
    headingEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

/**
 * 处理实体卡片点击 - 可以扩展为显示详情弹窗等
 */
const handleEntityClick = (entity: Entity) => {
  console.log('Entity clicked:', entity);
  // TODO: 可以实现实体详情弹窗或跳转
};
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

/*========== 宽屏三栏布局 ========== */
.widescreen-grid {
  display: grid;
  /* 左右侧栏吃掉“原本两边空白”，中间书本列保持固定观感宽度 */
  grid-template-columns: minmax(280px, 1fr) 1200px minmax(320px, 1fr);
  gap: 0;
}

.widescreen-left-panel {
  /* 左侧卷轴区域 */
  background: transparent;
  position: relative;
  z-index: 1;
}

.widescreen-center-panel {
  /* 中间书本区域 - 在grid 和 flex 布局中都适用 */
  flex: 1;
  position: relative;
  z-index: 10;
}

/* 宽屏三栏模式下：中间列已固定 1200px，去掉大 padding 避免“内扣”压缩书本视觉宽度 */
.widescreen-grid .widescreen-center-panel {
  padding: 0;
  overflow: visible;
}

/* 宽屏三栏模式下：让宽度主导，避免 h-full + aspect-ratio 在横向不足时导致宽度回缩 */
.widescreen-grid .book-container {
  width: 100%;
  max-width: 1200px;
  height: auto;
  max-height: 100%;
}

.widescreen-right-panel {
  /* 右侧散落区域 */
  background: transparent;
  padding: 1rem;
  position: relative;
  z-index: 1;
}

/* ========== 左右侧栏过渡动画 ========== */
/* 更柔和的“淡入 + 轻微位移”，避免跨断点时出现大幅滑动带来的跳变感 */
.fade-slide-left-enter-active,
.fade-slide-left-leave-active,
.fade-slide-right-enter-active,
.fade-slide-right-leave-active {
  transition: transform 0.42s ease-out, opacity 0.42s ease-out;
  will-change: transform, opacity;
}

.fade-slide-left-enter-from,
.fade-slide-left-leave-to {
  transform: translate3d(-18px, 0, 0);
  opacity: 0;
}

.fade-slide-right-enter-from,
.fade-slide-right-leave-to {
  transform: translate3d(18px, 0, 0);
  opacity: 0;
}

/* ========== 书本样式 ========== */
.book-container {
  /* 提升层级，确保侧栏动画/散落纸张不会遮挡书本与其阴影 */
  z-index: 20;
  aspect-ratio: 3/ 2;
  box-shadow:
    0 20px 50px -12px rgba(0, 0, 0, 0.5),
    0 10px 20px -5px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(94, 75, 53, 0.3),
    inset 20px 0 50px -10px rgba(0, 0, 0, 0.15),
    inset -2px 0 5px rgba(0, 0, 0, 0.05);
}

/*大屏幕上添加微妙的3D提升效果 */
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
  background: rgba(0, 0, 0, 0.05);
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
  height: 100%;width: 100%;/* 水平滚动翻页 */
  overflow-x: auto;overflow-y: hidden;
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
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
}

.bookmark-ribbon:hover {
  background: linear-gradient(to bottom, #a00000, #c00000);
}

/* 书签三角形颜色匹配页面背景 */
.bookmark-triangle {
  border-bottom-color: var(--color-parchment-light);
}
</style>
