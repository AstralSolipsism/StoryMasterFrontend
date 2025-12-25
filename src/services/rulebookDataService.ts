import type { BookNode, ChapterContent } from './mockData';

const DEFAULT_CONCURRENCY = 10;

/**
 * 生成带 Vite Base URL 的资源路径。
 * - public 目录下资源通过 `${BASE_URL}xxx` 访问
 * - BASE_URL 默认是 `/`，也可能是部署时的子路径
 */
function withBaseUrl(path: string): string {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}${path.replace(/^\//, '')}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`请求失败: ${url} (${response.status})`);
  }

  return (await response.json()) as T;
}

let catalogCache: BookNode | null = null;
const chapterCache = new Map<string, ChapterContent>();

/**
 * 加载目录树（一次性加载）
 */
export async function loadCatalog(): Promise<BookNode> {
  if (catalogCache) return catalogCache;

  const url = withBaseUrl('/data/toc.json');
  const data = await fetchJson<BookNode>(url);
  catalogCache = data;
  return data;
}

/**
 * 按需加载单个章节内容
 * - 404 返回 null（表示当前 public/data/chapters 下未包含该文件）
 * - 其它错误抛出异常，交由上层 try/catch 处理并做 mock fallback
 */
export async function loadChapterContent(chapterId: string): Promise<ChapterContent | null> {
  if (!chapterId) return null;

  const cached = chapterCache.get(chapterId);
  if (cached) return cached;

  const url = withBaseUrl(`/data/chapters/${encodeURIComponent(chapterId)}.json`);
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`章节内容加载失败: ${chapterId} (${response.status})`);
  }

  const data = (await response.json()) as ChapterContent;
  chapterCache.set(chapterId, data);
  return data;
}

/**
 * 构建章节内容映射（用于快速查找）
 * - 采用分批并发，避免一次性发起过多请求
 * - 返回结果只包含成功加载到的内容（404 会被跳过）
 */
export async function buildChapterContentMap(
  chapterIds: string[],
): Promise<Record<string, ChapterContent>> {
  const ids = Array.from(new Set(chapterIds)).filter(Boolean);

  const map: Record<string, ChapterContent> = {};
  for (let index = 0; index < ids.length; index += DEFAULT_CONCURRENCY) {
    const batch = ids.slice(index, index + DEFAULT_CONCURRENCY);

    const results = await Promise.all(
      batch.map(async (id) => {
        const content = await loadChapterContent(id);
        return { id, content };
      }),
    );

    for (const { id, content } of results) {
      if (content) {
        map[id] = content;
      }
    }
  }

  return map;
}