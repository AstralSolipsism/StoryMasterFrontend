<template>
  <div
    class="rulebook-container flex flex-col flex-grow min-h-0 overflow-hidden bg-transparent"
  >

    <!-- 宽屏三栏布局容器 -->
    <div
      class="flex-grow min-h-0 relative perspective-1000 overflow-hidden"
      :class="isWideLayout ? 'widescreen-grid' : 'flex'"
    >
      <!-- 窄屏模式：Backdrop for Sidebar (Mobile & Desktop Overlay) -->
      <div
        v-if="!isWideLayout && isSidebarOpen"
        class="absolute inset-0 z-30 rulebook-sidebar-backdrop glass-panel-sm glass-panel-dark transition-opacity duration-300"
        @click="isSidebarOpen = false"></div>

      <!-- 窄屏模式：Left Sidebar: Catalog Tree (Drawer style) -->
      <aside
        v-if="!isWideLayout"
        class="absolute top-0 left-0 z-50 h-full w-80 rulebook-sidebar glass-panel-dark flex flex-col transition-transform duration-300 ease-in-out"
        :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full']"
      >
        <div class="p-4 rulebook-sidebar-header glass-panel-sm glass-panel-dark font-bold text-stone-300 flex justify-between items-center">
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
        <div class="flex-grow overflow-y-auto p-4 custom-scrollbar">
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
          class="widescreen-left-panel glass-panel-dark h-full overflow-hidden flex flex-col p-4">
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
      <main class="widescreen-center-panel relative overflow-hidden px-4 md:px-6 py-4 flex justify-center items-center min-h-0">
        <!-- The Book Container -->
        <div
          ref="bookContainer"
          class="book-container mx-auto md:rounded-r-lg overflow-hidden flex flex-col relative shadow-2xl transition-all duration-300 transform-gpu bg-[#fdfbf7]"
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
            <span class="text-[#f5f5dc] text-xs font-cinzel font-bold rotate-90 whitespace-nowrap opacity-80 group-hover:opacity-100 transition-opacity mb-4">M E N U</span>
          </div>

          <!-- Book Spine (Visual only, on left for desktop) -->
          <div class="absolute left-0 top-0 bottom-0 w-2 md:w-6 bg-gradient-to-r from-[#2a1a10] to-[#5e4b35] z-20 shadow-xl"></div>
          
           <!-- Background Image -->
           <div class="absolute inset-0 pointer-events-none z-10 opacity-100 bg-cover bg-center" style="background-image: none;"></div>
           <!-- Texture Blend -->
           <div class="absolute inset-0 pointer-events-none z-10 mix-blend-multiply opacity-20 bg-transparent"></div>
           <div class="flex-1 px-4 pb-4 pt-16 md:px-6 md:py-8 relative z-10 overflow-hidden flex flex-col min-h-0">
             <!-- Page Content Wrapper -->
             <div class="flex flex-col flex-1 min-h-0">
              <!-- Breadcrumbs styled as header text -->
              <div class="text-xs text-stone-700/70 mb-4 font-serif uppercase tracking-widest border-b border-stone-800/20 pb-2 flex-shrink-0">
                <span class="text-stone-700/80">{{ $t('rulebook.title') }}</span>
                <span v-for="(crumb, index) in breadcrumbs" :key="crumb.id">
                  <span class="mx-1 text-stone-400">/</span>
                  <span :class="{'text-ink-red font-bold': index === breadcrumbs.length - 1}">{{ crumb.title }}</span>
                </span>
              </div>
              <div ref="pageViewport" class="flex-1 min-h-0 relative">
                <BookFlipContainer
                  v-if="currentContent"
                  :pages="paginatedPages"
                  :current-spread="currentSpread"
                  :is-flipping="isFlipping"
                  :flip-direction="flipDirection"
                  :flip-progress="flipProgress"
                />
                <div v-else class="text-center text-stone-500 py-32 italic flex flex-col items-center">
                  <span class="text-3xl mb-4 text-stone-400">❦</span>
                  {{ $t('rulebook.selectChapter') }}
                </div>
              </div>

              <!-- 页码显示 -->
              <div
                v-if="currentContent && pageIndicatorText"
                class="page-indicator absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-stone-600/70 font-serif pointer-events-none z-30"
              >
                <span class="px-3 py-1 bg-parchment-light/80 rounded-full shadow-sm">
                  {{ pageIndicatorText }}
                </span>
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
import BookFlipContainer from '../components/BookFlipContainer.vue';
import { PagePaginator, type PageContent } from '../utils/pagePaginator';
import { usePageFlip } from '../composables/usePageFlip';
import { ScrollableCatalogWrapper, DeskScatterLayout } from '../components/rulebook-desk-items';
import type { TocHeading } from '../components/rulebook-desk-items';

// ==========宽屏检测 ==========
/**宽屏断点阈值（像素）- 调整为 2200px 以确保有足够空间显示三栏布局 */
const WIDESCREEN_BREAKPOINT = 2200;

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
const pageViewport = ref<HTMLElement | null>(null);
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

const currentContent = computed(() => {
  return getContentById(activeContentId.value);
});

const debugRulebook = import.meta.env.DEV;

const logRulebookState = (label: string, extra: Record<string, unknown> = {}) => {
  if (!debugRulebook) return;

  const bookEl = bookContainer.value;
  const viewportEl = pageViewport.value;

  const payload = {
    ...extra,
    book: bookEl
      ? {
          clientWidth: bookEl.clientWidth,
          clientHeight: bookEl.clientHeight,
        }
      : null,
    viewport: viewportEl
      ? {
          clientWidth: viewportEl.clientWidth,
          clientHeight: viewportEl.clientHeight,
        }
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

  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyDown);

  // 添加窗口大小变化监听，重新计算页数
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  // 移除键盘事件监听
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('resize', handleResize);
});

/**
 * 键盘事件处理
 */
const flipNextOrNextChapter = async () => {
  await flipNextWithChapter();
};

const flipPrevOrPrevChapter = async () => {
  await flipPrevWithChapter();
};

const handleKeyDown = (e: KeyboardEvent) => {
  // 如果用户正在输入，不处理翻页
  const target = e.target as HTMLElement;
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return;
  }

  switch (e.key) {
    case 'ArrowLeft':
    case 'PageUp':
      e.preventDefault();
      void flipPrevOrPrevChapter();
      break;
    case 'ArrowRight':
    case 'PageDown':
    case ' ': // 空格键
      e.preventDefault();
      void flipNextOrNextChapter();
      break;
    case 'Home':
      e.preventDefault();
      goToFirstPage();
      break;
    case 'End':
      e.preventDefault();
      goToLastPage();
      break;
  }
};

/**
 * 窗口大小变化处理
 */
const handleResize = () => {
  // 防抖处理
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
  resizeTimer = window.setTimeout(() => {
    void paginateCurrentContent();
    if (currentSpread.value > maxSpread.value) currentSpread.value = maxSpread.value;
  }, 300);
};

let resizeTimer: number | null = null;

/**
 * 跳转到第一页
 */
const goToFirstPage = () => {
  if (isFlipping.value) return;
  currentSpread.value = 0;
};

/**
 * 跳转到最后一页
 */
const goToLastPage = () => {
  if (isFlipping.value) return;
  currentSpread.value = maxSpread.value;
};

// ========== Page Flip (3D Spread) ==========

const paginatedPages = ref<PageContent[]>([]);
const currentSpread = ref(0);

// headingId -> pageIndex (0-based)
const headingPageIndex = ref(new Map<string, number>());

const paginator = new PagePaginator();

// Cache by chapter + layout size to avoid re-pagination during minor UI events.
const paginationCache = new Map<string, PageContent[]>();

const stableHash = (input: string): string => {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
};

// Keep the slug algorithm in sync with MarkdownRenderer + TOC extraction.
const slugify = (s: string) => s.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

/**
 * Inject stable heading ids as raw HTML headings so ids remain consistent across pagination.
 * This avoids per-page markdown-it-anchor resetting duplicate counters.
 */
const injectStableHeadingIds = (markdown: string): string => {
  const lines = (markdown ?? '').replace(/\r\n/g, '\n').split('\n');
  const slugCounts: Record<string, number> = {};
  const uniqueSlugStartIndex = 1;

  return lines
    .map((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (!match || !match[1] || !match[2]) return line;

      const level = match[1].length;
      const text = match[2].trim();

      const base = slugify(text) || 'section';
      const seen = slugCounts[base] ?? 0;
      const id = seen === 0 ? base : `${base}-${seen - 1 + uniqueSlugStartIndex}`;
      slugCounts[base] = seen + 1;

      return `<h${level} id="${id}">${escapeHtml(text)}</h${level}>`;
    })
    .join('\n');
};

const buildHeadingPageIndex = (pages: PageContent[]) => {
  const map = new Map<string, number>();
  const re = /<h[1-6][^>]*\sid="([^"]+)"[^>]*>/g;

  pages.forEach((page, pageIndex) => {
    const content = page.content ?? '';
    for (const m of content.matchAll(re)) {
      const id = m[1];
      if (id && !map.has(id)) map.set(id, pageIndex);
    }
  });

  headingPageIndex.value = map;
};

const getPageLayout = () => {
  const viewport = pageViewport.value;
  if (!viewport) return null;

  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;
  if (vw <= 0 || vh <= 0) return null;

  const isNarrow = vw < 768;
  const pageWidth = vw / 2;

  // Keep in sync with BookPage / FlippingPage padding rules.
  // Keep in sync with BookPage / FlippingPage padding rules.
  const paddingX = isNarrow ? 18 : 22;
  const paddingY = isNarrow ? 18 : 22;
  const pageNumberSpace = 28;

  const contentWidth = Math.max(120, pageWidth - paddingX * 2);
  const contentHeight = Math.max(120, vh - paddingY * 2 - pageNumberSpace);

  return {
    vw,
    vh,
    isNarrow,
    pageWidth,
    contentWidth,
    contentHeight,
  };
};

const paginateCurrentContent = async () => {
  const chapter = currentContent.value;
  const layout = getPageLayout();

  if (!chapter?.content || !layout) {
    paginatedPages.value = [];
    headingPageIndex.value = new Map();
    currentSpread.value = 0;
    return;
  }

  const normalized = injectStableHeadingIds(chapter.content);
  const cacheKey = `${chapter.id}|${stableHash(normalized)}|${Math.round(layout.contentWidth)}|${Math.round(layout.contentHeight)}|16`;

  const cached = paginationCache.get(cacheKey);
  if (cached) {
    paginatedPages.value = cached;
    buildHeadingPageIndex(cached);
    return;
  }

  const pages = await paginator.paginateContent(
    normalized,
    layout.contentHeight,
    layout.contentWidth,
    16,
    { chapterId: chapter.id },
  );

  paginatedPages.value = pages;
  paginationCache.set(cacheKey, pages);
  buildHeadingPageIndex(pages);

  if (debugRulebook) {
    (window as any).__paginatedPages = pages;
  }
};

const {
  isFlipping,
  flipDirection,
  flipProgress,
  maxSpread,
  flipNext,
  flipPrev,
} = usePageFlip(paginatedPages, currentSpread, { durationMs: 800 });

const totalPages = computed(() => paginatedPages.value.length);

const pageIndicatorText = computed(() => {
  if (!totalPages.value || totalPages.value <= 1) return '';

  const left = currentSpread.value * 2 + 1;
  const right = left + 1;

  if (right <= totalPages.value) return `${left}-${right} / ${totalPages.value}`;
  return `${left} / ${totalPages.value}`;
});

// Used when navigating to the previous chapter: land on its last spread after pagination.
let pendingJumpToEnd = false;

watch(currentContent, async () => {
  await nextTick();
  await paginateCurrentContent();

  currentSpread.value = pendingJumpToEnd ? maxSpread.value : 0;
  pendingJumpToEnd = false;

  logRulebookState('paginated', {
    chapterId: currentContent.value?.id,
    pages: paginatedPages.value.length,
    maxSpread: maxSpread.value,
    currentSpread: currentSpread.value,
  });
});

// Cross-chapter flip support (e.g. last spread -> next chapter first spread).
let isCrossChapterFlipping = false;

const makeBlankPage = (chapterId: string, isLeftPage: boolean): PageContent => {
  return {
    pageNumber: 0,
    content: '',
    chapterId,
    isLeftPage,
  };
};

const getAdjacentChapterId = (direction: 'next' | 'prev'): string | null => {
  const leaves = getAllLeafNodes(catalogNodes.value);
  const currentIndex = leaves.findIndex((node) => node.id === activeContentId.value);
  if (currentIndex < 0) return null;

  const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
  const target = leaves[targetIndex];
  return target ? target.id : null;
};

const ensureChapterContentForAnimation = async (id: string): Promise<ChapterContent | null> => {
  if (!id) return null;

  const existing = getContentById(id);
  if (existing) return existing;

  try {
    const loaded = await loadChapterContent(id);
    if (loaded) {
      runtimeChapterContentMap.value[id] = loaded;
      return loaded;
    }
  } catch (e) {
    console.warn('[Rulebook] preload chapter content failed', { id, e });
  }

  const mock = mockChapterContent.value[id];
  if (mock) return mock;

  const node = findNodeById(catalogNodes.value, id);
  const title = node?.title || id;

  return {
    id,
    title,
    type: node?.type ?? 'section',
    parentId: node?.parentId,
    pageStart: node?.pageStart,
    pageEnd: node?.pageEnd,
    order: 0,
    relatedEntities: [],
    content: `# ${title}\n\n(Chapter content missing)\n\n- chapterId: ${id}\n- expected: /data/chapters/${id}.json\n`,
  };
};

const paginateChapterForAnimation = async (chapter: ChapterContent): Promise<PageContent[]> => {
  const layout = getPageLayout();
  if (!layout?.contentHeight || !layout?.contentWidth) return [];

  const normalized = injectStableHeadingIds(chapter.content);
  const cacheKey = `${chapter.id}|${stableHash(normalized)}|${Math.round(layout.contentWidth)}|${Math.round(layout.contentHeight)}|16`;

  const cached = paginationCache.get(cacheKey);
  if (cached) return cached;

  const pages = await paginator.paginateContent(
    normalized,
    layout.contentHeight,
    layout.contentWidth,
    16,
    { chapterId: chapter.id },
  );

  paginationCache.set(cacheKey, pages);
  return pages;
};

const getFirstSpreadPages = (pages: PageContent[], chapterId: string): [PageContent, PageContent] => {
  const left = pages[0] ?? makeBlankPage(chapterId, true);
  const right = pages[1] ?? makeBlankPage(chapterId, false);
  return [left, right];
};

const getLastSpreadPages = (pages: PageContent[], chapterId: string): [PageContent, PageContent] => {
  if (pages.length === 0) {
    return [makeBlankPage(chapterId, true), makeBlankPage(chapterId, false)];
  }

  // Odd page count ends on a left page.
  if (pages.length % 2 === 1) {
    return [pages[pages.length - 1]!, makeBlankPage(chapterId, false)];
  }

  return [pages[pages.length - 2]!, pages[pages.length - 1]!];
};

const flipToNextChapter = async () => {
  const nextId = getAdjacentChapterId('next');
  if (!nextId) return;
  if (isFlipping.value || isCrossChapterFlipping) return;

  isCrossChapterFlipping = true;
  try {
    const chapter = await ensureChapterContentForAnimation(nextId);
    const nextPages = chapter ? await paginateChapterForAnimation(chapter) : [];
    const [firstLeft, firstRight] = getFirstSpreadPages(nextPages, nextId);

    const currentPagesSnapshot = [...paginatedPages.value];
    const currentChapterId = currentContent.value?.id ?? currentPagesSnapshot[0]?.chapterId ?? 'unknown';
    const snapshotForAnimation =
      currentPagesSnapshot.length % 2 === 1
        ? [...currentPagesSnapshot, makeBlankPage(currentChapterId, false)]
        : currentPagesSnapshot;
    const endSpread = Math.max(0, Math.ceil(snapshotForAnimation.length / 2) - 1);

    // Temporarily append the next chapter's first spread so flipNext can animate.
    // If the current chapter ends on a left page (odd count), pad a blank right page so
    // we don't "leak" the next chapter's first page into the current spread before flipping.
    paginatedPages.value = [...snapshotForAnimation, firstLeft, firstRight];
    currentSpread.value = endSpread;
    await nextTick();

    await flipNext();
    await handleContentSelect(nextId);
  } finally {
    isCrossChapterFlipping = false;
  }
};

const flipToPrevChapter = async () => {
  const prevId = getAdjacentChapterId('prev');
  if (!prevId) return;
  if (isFlipping.value || isCrossChapterFlipping) return;

  isCrossChapterFlipping = true;
  try {
    const chapter = await ensureChapterContentForAnimation(prevId);
    const prevPages = chapter ? await paginateChapterForAnimation(chapter) : [];
    const [lastLeft, lastRight] = getLastSpreadPages(prevPages, prevId);

    const currentPagesSnapshot = [...paginatedPages.value];

    // Prepend the prev chapter's last spread so flipPrev can animate from spread 0.
    paginatedPages.value = [lastLeft, lastRight, ...currentPagesSnapshot];
    currentSpread.value = 1;
    await nextTick();

    await flipPrev();

    // After animation, switch active chapter and land on its end.
    pendingJumpToEnd = true;
    await handleContentSelect(prevId);
  } finally {
    isCrossChapterFlipping = false;
  }
};

const flipNextWithChapter = async () => {
  if (isFlipping.value || isCrossChapterFlipping) return;

  const did = await flipNext();
  if (did) return;

  if (currentSpread.value >= maxSpread.value) {
    await flipToNextChapter();
  }
};

const flipPrevWithChapter = async () => {
  if (isFlipping.value || isCrossChapterFlipping) return;

  const did = await flipPrev();
  if (did) return;

  if (currentSpread.value <= 0) {
    await flipToPrevChapter();
  }
};

const handleBookClick = async (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const selectedText = window.getSelection()?.toString() ?? '';
  const isInteractive = !!target.closest('a, button, .interactive-element, .bookmark-ribbon, .page-nav-hint');

  if (isInteractive || selectedText || isFlipping.value) {
    logRulebookState('click ignored', {
      isInteractive,
      selectedTextLength: selectedText.length,
      isFlipping: isFlipping.value,
      target: target.tagName,
    });
    return;
  }

  if (!bookContainer.value) return;

  const rect = bookContainer.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const width = rect.width;

  // Left edge 30% -> prev spread, Right edge 30% -> next spread
  if (x < width * 0.3) {
    await flipPrevWithChapter();
    return;
  }

  if (x > width * 0.7) {
    await flipNextWithChapter();
  }
};

const handleMouseMove = (e: MouseEvent) => {
  if (!bookContainer.value || isFlipping.value) return;

  const rect = bookContainer.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const width = rect.width;

  if (x < width * 0.3) {
    cursorStyle.value = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>') 16 16, pointer`;
  } else if (x > width * 0.7) {
    cursorStyle.value = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 7l5 5-5 5M6 7l5 5-5 5"/></svg>') 16 16, pointer`;
  } else {
    cursorStyle.value = 'auto';
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

/**
 * 获取目录树中的所有叶子节点（按顺序）
 */
const getAllLeafNodes = (nodes: BookNode[]): BookNode[] => {
  const leaves: BookNode[] = [];

  const traverse = (node: BookNode) => {
    if (!node.children || node.children.length === 0) {
      // 叶子节点
      leaves.push(node);
    } else {
      // 递归遍历子节点
      for (const child of node.children) {
        traverse(child);
      }
    }
  };

  for (const node of nodes) {
    traverse(node);
  }

  return leaves;
};

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
  if (!heading.id) return;

  const pageIndex = headingPageIndex.value.get(heading.id);
  if (pageIndex === undefined) return;

  currentSpread.value = Math.floor(pageIndex / 2);

  void nextTick(() => {
    const el = bookContainer.value?.querySelector?.(`[id=\"${heading.id}\"]`) as HTMLElement | null;
    if (!el) return;
    el.classList.add('toc-highlight');
    window.setTimeout(() => el.classList.remove('toc-highlight'), 900);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
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

.rulebook-header.glass-panel-dark {
  border: 0;
  border-bottom: 1px solid rgba(255, 248, 240, 0.16);
  border-radius: 0;
  --_glass-bg: rgba(42, 26, 16, 0.72);
  --_glass-border: rgba(255, 248, 240, 0.14);
}

.rulebook-sidebar-backdrop.glass-panel-sm.glass-panel-dark {
  border: 0;
  border-radius: 0;
  box-shadow: none;
  --_glass-bg: rgba(0, 0, 0, 0.35);
}

.rulebook-sidebar.glass-panel-dark {
  --_glass-bg: rgba(28, 17, 10, 0.72);
  --_glass-border: rgba(255, 248, 240, 0.12);
}

.rulebook-sidebar-header.glass-panel-sm.glass-panel-dark {
  border: 0;
  border-radius: 0;
  box-shadow: none;
  --_glass-bg: rgba(0, 0, 0, 0.18);
  border-bottom: 1px solid rgba(255, 248, 240, 0.12);
}

/*========== 宽屏三栏布局 ========== */
.widescreen-grid {
  display: grid;
  /* 使用 auto 让左右侧栏自动填充剩余空间，实现居中效果 */
  grid-template-columns: minmax(280px, auto) minmax(1000px, 1800px) minmax(280px, auto);
  gap: 0;
  justify-content: center;
  overflow: hidden;
  height: 100%;  /* 关键：限制Grid容器高度为100% */
}

.widescreen-left-panel {
  /* 左侧卷轴区域 */
  position: relative;
  z-index: 1;
}

.widescreen-center-panel {
  /* 中间书本区域 - 在grid 和 flex 布局中都适用 */
  flex: 1;
  position: relative;
  z-index: 10;
}

/* 宽屏三栏模式下：中间列已使用 minmax，减少 padding 增加可用空间 */
.widescreen-grid .widescreen-center-panel {
  padding: 0.5rem;  /* 从1rem减少到0.5rem */
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
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
  width: 100%;
  height: 100%;
  box-shadow:
    0 20px 50px -12px rgba(0, 0, 0, 0.5),
    0 10px 20px -5px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(94, 75, 53, 0.3),
    inset 20px 0 50px -10px rgba(0, 0, 0, 0.15),
    inset -2px 0 5px rgba(0, 0, 0, 0.05);
}

/* 桌面端：固定单页宽高比 4/5 => 双页展开 8/5 */
@media (min-width: 768px) {
  .book-container {
    height: auto;
    width: min(100%, calc((100vh - 120px) * 1.6));
    width: min(100%, calc((100dvh - 120px) * 1.6));
    aspect-ratio: 8 / 5;
  }
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

/* ========== 翻页动画效果 ========== */
.book-container {
  /* Page flip animates the leaf; keep the book container stable. */
  transform-style: preserve-3d;
}

/* 页码指示器样式 */
.page-indicator {
  font-family: var(--font-serif);
  letter-spacing: 0.05em;
  user-select: none;
}

.page-indicator span {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Brief highlight when jumping via TOC */
:deep(.toc-highlight) {
  outline: 2px solid rgba(245, 158, 11, 0.55);
  background: rgba(245, 158, 11, 0.10);
  border-radius: 6px;
}


/* 极小视口优化 */
@media (max-height: 600px) {
  .book-container {
    min-height: 400px;
    aspect-ratio: unset;
    height: calc(100vh - 80px);
  }

  .widescreen-grid .widescreen-center-panel {
    padding: 0.25rem;
  }
}

</style>
