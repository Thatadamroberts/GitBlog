import matter from 'gray-matter';
import { marked } from 'marked';
import { readFile } from 'node:fs/promises';
import config from '../../site.config';

export interface Project {
  slug: string;
  name: string;
  title: string;
  summary: string;
  url: string;
  homepage: string | null;
  topics: string[];
  language: string | null;
  languageColor: string | null;
  stars: number;
  updatedAt: string;
  image: string;
  imageAlt: string;
  html: string;
  /** Where the write-up came from: the post file, the README, or only the description. */
  source: 'post' | 'readme' | 'description';
  featured: boolean;
  order: number | null;
}

const IMAGE_NAMES = ['png', 'jpg', 'jpeg', 'webp', 'gif'].map((e) => `screenshot.${e}`);

const QUERY = `
query($login: String!, $cursor: String) {
  user(login: $login) {
    repositories(first: 50, after: $cursor, privacy: PUBLIC, ownerAffiliations: OWNER,
                 orderBy: {field: PUSHED_AT, direction: DESC}) {
      pageInfo { hasNextPage endCursor }
      nodes {
        name url homepageUrl description stargazerCount pushedAt isFork isArchived
        openGraphImageUrl usesCustomOpenGraphImage
        defaultBranchRef { name }
        primaryLanguage { name color }
        repositoryTopics(first: 20) { nodes { topic { name } } }
        post: object(expression: "HEAD:.gitblog/post.md") { ... on Blob { text } }
        gitblogDir: object(expression: "HEAD:.gitblog") { ... on Tree { entries { name } } }
        readme: object(expression: "HEAD:README.md") { ... on Blob { text } }
      }
    }
  }
}`;

type RepoNode = any;

async function fetchRepos(): Promise<RepoNode[]> {
  // Offline mode: GITBLOG_FIXTURE=path/to/repos.json uses saved data instead of the API.
  if (process.env.GITBLOG_FIXTURE) {
    return JSON.parse(await readFile(process.env.GITBLOG_FIXTURE, 'utf8'));
  }
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is not set. Set it, or set GITBLOG_FIXTURE to build from fixtures/repos.json.');
  }
  const nodes: RepoNode[] = [];
  let cursor: string | null = null;
  do {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { login: config.username, cursor } }),
    });
    const json: any = await res.json();
    if (!res.ok || json.errors) {
      throw new Error(`GitHub API error: ${JSON.stringify(json.errors ?? json)}`);
    }
    const page = json.data.user.repositories;
    nodes.push(...page.nodes);
    cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (cursor);
  return nodes;
}

function rawUrl(repo: RepoNode, path: string) {
  const branch = repo.defaultBranchRef?.name ?? 'HEAD';
  return `https://raw.githubusercontent.com/${config.username}/${repo.name}/${branch}/${path.replace(/^\.?\//, '')}`;
}

function blobUrl(repo: RepoNode, path: string) {
  const branch = repo.defaultBranchRef?.name ?? 'HEAD';
  return `${repo.url}/blob/${branch}/${path.replace(/^\.?\//, '')}`;
}

const isAbsolute = (href: string) => /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href);

/** Resolve a path relative to `baseDir` inside the repo ("" = repo root). */
function resolvePath(baseDir: string, href: string) {
  if (href.startsWith('/')) return href.slice(1);
  const parts = baseDir ? baseDir.split('/') : [];
  for (const seg of href.split('/')) {
    if (seg === '..') parts.pop();
    else if (seg !== '.' && seg !== '') parts.push(seg);
  }
  return parts.join('/');
}

/** Render Markdown, pointing relative images at raw files and relative links at GitHub. */
function render(repo: RepoNode, md: string, baseDir: string) {
  const html = marked.parse(md, { async: false }) as string;
  return html
    .replace(/(<img\b[^>]*?\bsrc=")([^"]+)"/g, (m, pre, src) =>
      isAbsolute(src) ? m : `${pre}${rawUrl(repo, resolvePath(baseDir, src))}"`)
    .replace(/(<a\b[^>]*?\bhref=")([^"]+)"/g, (m, pre, href) =>
      isAbsolute(href) ? m : `${pre}${blobUrl(repo, resolvePath(baseDir, href))}"`);
}

/** The README's opening: everything up to the third second-level heading. */
function readmeExcerpt(text: string) {
  // Drop a leading "# Title" line: the page already shows the title.
  const lines = text.replace(/^\s*#\s[^\n]*\n/, '').split('\n');
  let h2 = 0;
  const out: string[] = [];
  for (const line of lines) {
    if (/^##\s/.test(line) && ++h2 > 2) break;
    out.push(line);
  }
  return out.join('\n');
}

function toProject(repo: RepoNode): Project {
  const topics: string[] = repo.repositoryTopics.nodes.map((n: any) => n.topic.name);
  const entries: string[] = repo.gitblogDir?.entries?.map((e: any) => e.name) ?? [];

  let data: Record<string, any> = {};
  let html: string;
  let source: Project['source'];
  if (repo.post?.text) {
    const parsed = matter(repo.post.text);
    data = parsed.data;
    html = render(repo, parsed.content, '.gitblog');
    source = 'post';
  } else if (repo.readme?.text) {
    html = render(repo, readmeExcerpt(repo.readme.text), '');
    source = 'readme';
  } else {
    html = repo.description ? `<p>${escapeHtml(repo.description)}</p>` : '';
    source = 'description';
  }

  // Image fallback chain: front-matter image → .gitblog/screenshot.* → GitHub's
  // social preview (custom if set, otherwise the auto-generated card).
  const screenshot = IMAGE_NAMES.find((n) => entries.includes(n));
  const image = data.image
    ? (isAbsolute(data.image) ? data.image : rawUrl(repo, data.image))
    : screenshot
      ? rawUrl(repo, `.gitblog/${screenshot}`)
      : repo.openGraphImageUrl;

  const title = data.title ?? repo.name;
  return {
    slug: repo.name.toLowerCase(),
    name: repo.name,
    title,
    summary: data.summary ?? repo.description ?? '',
    url: repo.url,
    homepage: repo.homepageUrl || null,
    topics: topics.filter((t) => t !== config.topic),
    language: repo.primaryLanguage?.name ?? null,
    languageColor: repo.primaryLanguage?.color ?? null,
    stars: repo.stargazerCount,
    updatedAt: repo.pushedAt,
    image,
    imageAlt: data.imageAlt ?? `Screenshot of ${title}`,
    html,
    source,
    featured: Boolean(data.featured),
    order: typeof data.order === 'number' ? data.order : null,
  };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

let cache: Promise<Project[]> | undefined;

/** All repos tagged with the configured topic, featured first, then by `order`, then most recent. */
export function getProjects(): Promise<Project[]> {
  cache ??= fetchRepos().then((repos) =>
    repos
      .filter((r) => !r.isFork && !r.isArchived)
      .filter((r) => r.repositoryTopics.nodes.some((n: any) => n.topic.name === config.topic))
      .map(toProject)
      .sort((a, b) =>
        Number(b.featured) - Number(a.featured) ||
        (a.order ?? Infinity) - (b.order ?? Infinity) ||
        b.updatedAt.localeCompare(a.updatedAt)),
  );
  return cache;
}
