export type KBManifest = {
  kb_version: string;
  effective_date: string;
  approval: { status: "draft" | "pending" | "approved" | "retired"; approved_by_role: string; approved_date: string };
  files: { sources: string; sections: string; search_index: string };
  
// ✅ ADD THIS:
  changelog: Array<{
    date: string;
    summary: string;
    files_changed?: string[];
    ticket_or_reason?: string;
  }>;
};

export type KBSource = {
  source_id: string;
  type: string;
  title: string;
  jurisdiction?: string;
  effective_date?: string;
  review_by?: string;
  url_or_location?: string;
  tags?: string[];
};

export type SearchDoc = {
  id: string;
  source_id: string;
  section_id: string;
  title: string;
  heading: string;
  type: string;
  jurisdiction: string;
  effective_date: string;
  review_by: string;
  url_or_location: string;
  tags: string[];
  text: string;
};

export type KBLoaded = {
  manifest: KBManifest;
  sources: KBSource[];
  searchIndex: { kb_version: string; generated_at: string; docs: SearchDoc[] };
};

const cacheKeys = {
  manifest: "kb_manifest_cache_v1",
  sources: "kb_sources_cache_v1",
  searchIndex: "kb_search_index_cache_v1"
};

function readCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore cache write failures
  }
}

async function fetchJsonWithRetry<T>(url: string, retries = 2, backoffMs = 300): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, backoffMs * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

export async function loadKB(): Promise<KBLoaded> {
  const bust = Date.now();
  let manifest: KBManifest;
  try {
    manifest = await fetchJsonWithRetry<KBManifest>(`/kb/manifest.json?v=${bust}`);
    writeCache(cacheKeys.manifest, manifest);
  } catch (err) {
    const cached = readCache<KBManifest>(cacheKeys.manifest);
    if (!cached) throw err;
    manifest = cached;
  }

  let sourcesJson: { sources: KBSource[] };
  try {
    sourcesJson = await fetchJsonWithRetry<{ sources: KBSource[] }>(`/kb/${manifest.files.sources}`);
    writeCache(cacheKeys.sources, sourcesJson);
  } catch (err) {
    const cached = readCache<{ sources: KBSource[] }>(cacheKeys.sources);
    if (!cached) throw err;
    sourcesJson = cached;
  }

  let searchIndex: KBLoaded["searchIndex"];
  try {
    searchIndex = await fetchJsonWithRetry<KBLoaded["searchIndex"]>(`/kb/${manifest.files.search_index}`);
    writeCache(cacheKeys.searchIndex, searchIndex);
  } catch (err) {
    const cached = readCache<KBLoaded["searchIndex"]>(cacheKeys.searchIndex);
    if (!cached) throw err;
    searchIndex = cached;
  }

  return { manifest, sources: sourcesJson.sources, searchIndex };
}
