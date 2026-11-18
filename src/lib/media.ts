import { readFile } from 'node:fs/promises';
import path from 'node:path';
import config from '../../site.config';

/**
 * Images are copied into the built site instead of being linked from raw.githubusercontent.com.
 * That keeps visitors off GitHub's raw servers, and it's the only way images from private repos
 * can be shown at all: their raw URLs need a token.
 *
 * During the build, `mediaUrl()` records each image a page needs and returns its local URL.
 * `downloadAll()` then fetches them once, and the static endpoint in src/pages/media/ writes
 * each one out as a file.
 */

type Source =
  | { kind: 'repo'; repo: string; branch: string; file: string }
  | { kind: 'url'; url: string };

const wanted = new Map<string, Source>();
const downloaded = new Map<string, Uint8Array>();

const base = () => (import.meta.env?.BASE_URL ?? '/').replace(/\/?$/, '/');

/** Site path for an image, e.g. "skyreign/_gitblog/screenshot.jpg" (no leading dot folders). */
function sitePath(repo: string, file: string) {
  const clean = file.split('/').filter(Boolean).map((s) => s.replace(/^\./, '_')).join('/');
  return `${repo.toLowerCase()}/${clean}`;
}

/** Local URL for a file in a repo, recorded for download. */
export function mediaUrl(repo: string, branch: string, file: string): string {
  const key = sitePath(repo, file);
  if (!wanted.has(key)) wanted.set(key, { kind: 'repo', repo, branch, file });
  return `${base()}media/${key}`;
}

/** Local URL for an image hosted elsewhere (the GitHub social preview card). */
export function remoteMediaUrl(repo: string, name: string, url: string): string {
  const key = sitePath(repo, name);
  if (!wanted.has(key)) wanted.set(key, { kind: 'url', url });
  return `${base()}media/${key}`;
}

/** Whether an image recorded under this local URL was actually downloaded. */
export function hasMedia(localUrl: string): boolean {
  return downloaded.has(localUrl.slice(`${base()}media/`.length));
}

async function fetchSource(src: Source): Promise<Uint8Array | null> {
  // Offline mode: GITBLOG_FIXTURE_MEDIA=<dir> reads <dir>/<repo name in lower case>/<file>.
  const fixtureDir = process.env.GITBLOG_FIXTURE_MEDIA;
  if (process.env.GITBLOG_FIXTURE) {
    if (!fixtureDir || src.kind !== 'repo') return null;
    try {
      return new Uint8Array(await readFile(path.join(fixtureDir, src.repo.toLowerCase(), src.file)));
    } catch {
      return null;
    }
  }
  if (src.kind === 'url') {
    const res = await fetch(src.url).catch(() => null);
    return res?.ok ? new Uint8Array(await res.arrayBuffer()) : null;
  }
  const file = src.file.split('/').map(encodeURIComponent).join('/');
  const url = `https://api.github.com/repos/${config.username}/${src.repo}/contents/${file}?ref=${encodeURIComponent(src.branch)}`;
  const res = await fetch(url, {
    headers: { Authorization: `bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github.raw' },
  }).catch(() => null);
  if (!res?.ok) {
    console.warn(`[gitblog] Couldn't download ${src.repo}/${src.file} (${res?.status ?? 'network error'})`);
    return null;
  }
  return new Uint8Array(await res.arrayBuffer());
}

/** Download every recorded image that hasn't been fetched yet, a few at a time. */
export async function downloadAll(): Promise<void> {
  const todo = [...wanted].filter(([key]) => !downloaded.has(key));
  let next = 0;
  const worker = async () => {
    while (next < todo.length) {
      const [key, src] = todo[next++];
      const bytes = await fetchSource(src);
      if (bytes) downloaded.set(key, bytes);
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
}

/** Every downloaded image, for the static endpoint. */
export function mediaEntries(): [string, Uint8Array][] {
  return [...downloaded];
}
