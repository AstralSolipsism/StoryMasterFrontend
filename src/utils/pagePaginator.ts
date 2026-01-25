import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';

export interface PageContent {
  pageNumber: number;
  content: string;
  chapterId: string;
  isLeftPage: boolean;
}

type PaginationOptions = {
  chapterId?: string;
  startPageNumber?: number;
  /**
   * Extra pixels reserved for safety so pagination errs on the side of leaving
   * whitespace instead of overflowing/clipping.
   */
  safetyPaddingPx?: number;
};

/**
 * A pragmatic paginator for Markdown content.
 *
 * It splits markdown into block-ish chunks (separated by blank lines), measures
 * rendered heights in an offscreen DOM container, then packs blocks into pages.
 *
 * This is intentionally conservative: we bias toward slightly fewer words per
 * page to avoid overflow.
 */
export class PagePaginator {
  private readonly md: MarkdownIt;
  private measureEl: HTMLDivElement | null = null;
  private lastMeasureWidthPx = 0;
  private lastFontSizePx = 16;

  // Cache: key = `${width}|${fontSize}|${hash(markdown)}`
  private heightCache = new Map<string, number>();

  constructor() {
    // Match MarkdownRenderer's markdown-it config closely.
    const slugify = (s: string) => s.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');

    this.md = new MarkdownIt({
      html: true,
      breaks: true,
      typographer: true,
    }).use(anchor, {
      permalink: false,
      slugify,
    });
  }

  async paginateContent(
    markdown: string,
    containerHeight: number,
    containerWidth: number,
    fontSize: number,
    options: PaginationOptions = {},
  ): Promise<PageContent[]> {
    const chapterId = options.chapterId ?? '';
    const startPageNumber = options.startPageNumber ?? 1;
    const safetyPaddingPx = options.safetyPaddingPx ?? 24;

    const widthPx = Math.max(1, Math.floor(containerWidth));
    const heightPx = Math.max(1, Math.floor(containerHeight - safetyPaddingPx));
    const fontSizePx = Math.max(12, Math.floor(fontSize));

    const source = (markdown ?? '').replace(/\r\n/g, '\n').trim();
    if (!source) {
      return [
        {
          pageNumber: startPageNumber,
          content: '',
          chapterId,
          isLeftPage: true,
        },
      ];
    }

    const blocks = this.splitIntoBlocks(source);
    const pages: string[] = [];
    let currentBlocks: string[] = [];
    let currentHeight = 0;

    for (let i = 0; i < blocks.length; i += 1) {
      const block = blocks[i] ?? '';
      const nextBlock = blocks[i + 1];

      // Heading protection: if a heading would end up as the last thing on a
      // page with no room for the next block, push it to the next page.
      if (this.isHeadingBlock(block) && currentBlocks.length > 0 && nextBlock) {
        const combined = `${block}\n\n${nextBlock}`;
        const combinedHeight = await this.measureMarkdownHeight(combined, widthPx, fontSizePx);
        const remaining = heightPx - currentHeight;
        if (combinedHeight > remaining) {
          pages.push(currentBlocks.join('\n\n'));
          currentBlocks = [];
          currentHeight = 0;
        }
      }

      const blockHeight = await this.measureMarkdownHeight(block, widthPx, fontSizePx);

      // Oversized single block: split by lines as a last resort.
      if (blockHeight > heightPx && currentBlocks.length === 0) {
        const chunks = await this.splitOversizedBlock(block, heightPx, widthPx, fontSizePx);
        for (const chunk of chunks) {
          pages.push(chunk);
        }
        continue;
      }

      if (currentHeight + blockHeight <= heightPx || currentBlocks.length === 0) {
        currentBlocks.push(block);
        currentHeight += blockHeight;
      } else {
        pages.push(currentBlocks.join('\n\n'));
        currentBlocks = [block];
        currentHeight = blockHeight;
      }
    }

    if (currentBlocks.length > 0) {
      pages.push(currentBlocks.join('\n\n'));
    }

    // Build PageContent records.
    return pages.map((content, index) => {
      const pageNumber = startPageNumber + index;
      return {
        pageNumber,
        content,
        chapterId,
        isLeftPage: index % 2 === 0,
      };
    });
  }

  private splitIntoBlocks(markdown: string): string[] {
    // Split on blank lines, but keep list blocks intact as long as the author
    // didn't insert blank lines between list items.
    const raw = markdown.split(/\n{2,}/g).map((s) => s.trim()).filter(Boolean);

    // Merge consecutive list fragments that accidentally got separated by a
    // single blank line (common in copied content).
    const merged: string[] = [];
    for (const block of raw) {
      const prev = merged[merged.length - 1];
      if (prev && this.looksLikeListBlock(prev) && this.looksLikeListBlock(block)) {
        merged[merged.length - 1] = `${prev}\n${block}`;
      } else {
        merged.push(block);
      }
    }

    return merged;
  }

  private looksLikeListBlock(block: string): boolean {
    const firstLine = block.split('\n')[0] ?? '';
    return /^(\s*[-*+]|\s*\d+\.)\s+/.test(firstLine);
  }

  private isHeadingBlock(block: string): boolean {
    const firstLine = block.split('\n')[0] ?? '';
    return /^(#{1,6})\s+.+/.test(firstLine.trim());
  }

  private ensureMeasureEl(widthPx: number, fontSizePx: number): HTMLDivElement {
    if (!this.measureEl) {
      this.measureEl = document.createElement('div');
      this.measureEl.setAttribute('data-page-paginator', 'measure');
      // Keep it offscreen but still renderable.
      Object.assign(this.measureEl.style, {
        position: 'absolute',
        top: '0',
        left: '-99999px',
        visibility: 'hidden',
        pointerEvents: 'none',
        // Prevent layout constraints from elsewhere.
        boxSizing: 'border-box',
      } as Partial<CSSStyleDeclaration>);
      document.body.appendChild(this.measureEl);
    }

    if (this.lastMeasureWidthPx !== widthPx || this.lastFontSizePx !== fontSizePx) {
      this.lastMeasureWidthPx = widthPx;
      this.lastFontSizePx = fontSizePx;

      // Approximate MarkdownRenderer's typography in a conservative way.
      Object.assign(this.measureEl.style, {
        width: `${widthPx}px`,
        fontSize: `${fontSizePx}px`,
        lineHeight: '1.65',
        fontFamily: 'var(--font-serif)',
        // Avoid giant default margins from prose styles.
        margin: '0',
        padding: '0',
      } as Partial<CSSStyleDeclaration>);

      this.measureEl.className = 'prose prose-stone max-w-none';
    }

    return this.measureEl;
  }

  private async measureMarkdownHeight(markdown: string, widthPx: number, fontSizePx: number): Promise<number> {
    const key = `${widthPx}|${fontSizePx}|${this.hash(markdown)}`;
    const cached = this.heightCache.get(key);
    if (cached !== undefined) return cached;

    const el = this.ensureMeasureEl(widthPx, fontSizePx);
    el.innerHTML = this.md.render(markdown);

    // Images can report 0 height before they load, which would undercount and
    // cause overflow. Wait briefly for image load/error when present.
    const imgs = Array.from(el.querySelectorAll('img'));
    if (imgs.length > 0) {
      await this.waitForImages(imgs, 500);
    }

    // scrollHeight is more stable than getBoundingClientRect here.
    const height = Math.ceil(el.scrollHeight);

    // Add a small per-block cushion to reduce overflow risk.
    const padded = height + 6;
    this.heightCache.set(key, padded);
    return padded;
  }

  private async waitForImages(imgs: HTMLImageElement[], timeoutMs: number): Promise<void> {
    const pending = imgs.filter((img) => !img.complete);
    if (pending.length === 0) return;

    await Promise.race([
      Promise.all(
        pending.map(
          (img) =>
            new Promise<void>((resolve) => {
              const done = () => resolve();
              img.addEventListener('load', done, { once: true });
              img.addEventListener('error', done, { once: true });
            }),
        ),
      ),
      new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs)),
    ]);
  }

  private async splitOversizedBlock(
    block: string,
    pageHeightPx: number,
    widthPx: number,
    fontSizePx: number,
  ): Promise<string[]> {
    const lines = block.split('\n');
    const chunks: string[] = [];
    let buf: string[] = [];

    for (const line of lines) {
      const candidate = [...buf, line].join('\n');
      const h = await this.measureMarkdownHeight(candidate, widthPx, fontSizePx);
      if (h <= pageHeightPx || buf.length === 0) {
        buf.push(line);
      } else {
        chunks.push(buf.join('\n').trim());
        buf = [line];
      }
    }

    if (buf.length > 0) {
      chunks.push(buf.join('\n').trim());
    }

    return chunks.filter(Boolean);
  }

  private hash(input: string): string {
    // Simple non-cryptographic hash to keep cache keys small.
    let h = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16);
  }
}

