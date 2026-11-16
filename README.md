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
   playable: true                # embed the game on its page (see below)
   play: https://example.com/    # optional: where to play it, if not the repo's Website field
   ---
   ```

   Relative images and links in `post.md` resolve against the `.gitblog/` folder.

**Where each piece comes from**

| Shown on site | Source, in order of preference |
| --- | --- |
| Write-up | `.gitblog/post.md` → README (up to its third `##` section) → repo description |
| Image | front-matter `image` → `.gitblog/screenshot.*` → social preview (Settings → Social preview) → GitHub's generated card |
| Title / summary | front-matter → repo name / description |
| Type and "Built with" tags | the repo's topics and its main languages (see below) |
| Stars, live-site / Play link | the repo's stars and *Website* field |

Forks and archived repos are skipped.

## Tags and filters

The front page has two rows of filter chips, both built from GitHub:

- **Type**: what a project is. These come from the repo's GitHub topics that are listed under
  `types` in `site.config.ts` (to start with: `game`, `productivity`, `health`, `m365`, `history`,
  `tool`). Tag a repo with the topic `game` and it appears under *Game*.
- **Built with**: the repo's main languages (anything making up at least 10% of its code, ignoring
  build-script languages such as Shell), followed by every other topic, such as `android`, `pwa`
  or `jetpack-compose`.

GitHub topics are lowercase, so `labels` in `site.config.ts` gives them display names
(`m365` → *Microsoft 365*, `pwa` → *PWA*). Add a new type by adding its topic to `types` and a
label if it needs one.

Picking several chips in one row shows projects with any of them; picking chips in both rows
narrows to projects matching both. The filter is kept in the address (for example
`?type=game&tech=android`), so a filtered view can be shared. The tags on each card and project
page link to that filter. Without JavaScript the filters are hidden and every project shows.

## Playable projects

Projects that run in a browser get a green **▶ Play** button on their page and a Play badge on
their card. The button links to the repo's *Website* field (or the `play:` URL in `post.md`) when
either the post says `playable: true` or the repo has the `game` topic.

With `playable: true`, the project page also embeds the game: the hero image becomes a cover with
a Play button, and clicking it loads the game in place, with links to go full screen or open it in
a new tab. Nothing loads until someone presses Play, so the page stays fast. Set `embed: false` to
keep the Play button but skip the embed.

A static web game can be published with a small GitHub Pages workflow in its own repo; set the
repo's *Website* field to the Pages address (`https://<user>.github.io/<repo>/`).

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
