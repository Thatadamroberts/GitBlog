# GitBlog

A portfolio site built from my public GitHub repositories. Each project's
content lives in its own repository; this repo only holds the site.

## Adding a project

1. Add the topic **`gitblog`** to a public repository (repo page → ⚙ next to *About*).
   That's enough for it to appear: the site uses the repo description and the opening of the README.
2. To write about it properly, add a `.gitblog/` folder to that repository:

   ```
   .gitblog/
     post.md          # your write-up
     screenshot.png   # hero image (.png, .jpg, .webp or .gif)
   ```

   `post.md` is Markdown, with optional front-matter:

   ```yaml
   ---
   title: Weather Station        # default: repo name
   summary: One-line pitch       # default: repo description
   featured: true                # full-width card, listed first
   order: 1                      # manual sort (lower first); default: most recently pushed
   image: .gitblog/demo.gif      # override the hero image
   imageAlt: Dashboard showing today's readings
   ---
   ```

   Relative images and links in `post.md` resolve against the `.gitblog/` folder.

**Where each piece comes from**

| Shown on site | Source, in order of preference |
| --- | --- |
| Write-up | `.gitblog/post.md` → README (up to its third `##` section) → repo description |
| Image | front-matter `image` → `.gitblog/screenshot.*` → social preview (Settings → Social preview) → GitHub's generated card |
| Title / summary | front-matter → repo name / description |
| Tags, language, stars, live-site link | the repo's topics, primary language, stars and *Website* field |

Forks and archived repos are skipped.

## Running locally

```bash
npm install
GITHUB_TOKEN=<a token with public read access> npm run dev
```

Or work offline from sample data:

```bash
GITBLOG_FIXTURE=fixtures/repos.json npm run dev
```

The username, topic, title and bio are set in `site.config.ts`.

## Deploying

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`,
daily, and on manual runs. To enable it: repo **Settings → Pages → Source: GitHub Actions**.

To make a new write-up appear right away instead of at the next daily build, a project repo can
send a `repository_dispatch` event of type `gitblog-update` to this repo (this needs a token with
access to this repo).
