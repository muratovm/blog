# Blog

## Current State
This site is a Hugo blog (`hugo v0.155+`) using the local theme at `themes/hugo-simple`.

It is set up for:
- Weekly publishing from a draft-first workflow (`content/drafts` -> `content/blog`)
- Structured track navigation (Builds, Guides, Notes)
- A custom homepage layout with pinned posts, recent activity, and recently updated content
- A custom `/blog/` hub page focused on 4 navigation cards (Builds, Guides, Notes, Series)
- Machine-readable outputs for feeds and LLM ingestion (`index.json`, `llms.txt`)
- A machine-readable project status endpoint sourced from homepage front matter (`/status.json`)

## Recent Tweaks
- Added global header corner activity grids (static seeded state, no live animation)
- Added a homepage `Momentum` component with 7-day counters + 8-week sparkline
- Reduced `Latest Feature` card height to keep top-of-home content visible with new status widgets
- Improved small-screen related content cards to use full column width
- Enabled per-article comments with Giscus (GitHub Discussions-backed)
- Ongoing custom palette and interaction tuning lives in:
  - `themes/hugo-simple/assets/style.css`
  - `themes/hugo-simple/assets/simple.css`
  - `static/js/script.js`

## Stack
- Hugo (extended)
- Theme: local `themes/hugo-simple`
- Node scripts (optional but used for workflow commands)

## Local Development
- Start local server: `npm run dev`
- Build production output: `npm run build:site`
- Output directory: `public/`

Local server is pinned to:
- `http://127.0.0.1:1313/`

## Article Workflow
- Create draft bundle: `npm run new:article -- <slug>`
- Publish draft: `npm run publish:article -- <draft-slug-or-path>`
- Validate published posts: `npm run check:posts`
- Validate draft rules: `npm run check:drafts`
- Validate image references: `npm run check:assets`
- Full strict gate: `npm run check:strict`
- Weekly flow: `npm run weekly`

## Content Structure
- `content/_index.md`
  - Home metadata + curated `start_here` slugs
- `content/blog/`
  - Published posts only
- `content/drafts/`
  - Draft posts only (`draft: true` before publish)
- `content/archive/_index.md`
  - Archive landing content
- `content/about.md`, `content/activity.md`
  - Static top-level pages

Track-style organization is kept in folder paths under `content/blog/` using bracketed folders (for author-side clarity), for example:
- `content/blog/[builds]/...`
- `content/blog/[guides]/...`
- `content/blog/[notes]/...`

## Theme/Layout Ownership
- `themes/hugo-simple/layouts/index.html`
  - Home page layout structure
- `themes/hugo-simple/layouts/blog/list.html`
  - Custom main blog list page (`/blog/`) layout and card-based navigation
- `themes/hugo-simple/layouts/archive/list.html`
  - Archive page rendering (grouped chronologically)
- `themes/hugo-simple/layouts/series/terms.html`
- `themes/hugo-simple/layouts/series/taxonomy.html`
  - Series index and term page rendering
- `themes/hugo-simple/layouts/_default/single.html`
- `themes/hugo-simple/layouts/_default/blog-post.html`
  - Article templates, related-content fallback, and series next/previous nav
- `themes/hugo-simple/layouts/partials/breadcrumbs.html`
  - Breadcrumb navigation (rendered globally for non-home pages)
- `themes/hugo-simple/layouts/partials/nav.html`
  - Global header nav
- `themes/hugo-simple/layouts/partials/footer.html`
  - Footer + social links rendering
- `themes/hugo-simple/layouts/partials/status_blurb.html`
  - Reusable homepage status/in-progress component
- `themes/hugo-simple/layouts/partials/momentum_blurb.html`
  - Reusable homepage momentum component (7-day metrics + 8-week trend)
- `themes/hugo-simple/layouts/partials/comments.html`
  - Reusable article comments component (Giscus)
- `themes/hugo-simple/layouts/index.status.json`
  - Dedicated machine-readable project status output
- `themes/hugo-simple/assets/style.css`
  - Site-level custom styling

## Assets
- `assets/banners/`
  - Banner images used by front matter `image`
- `static/img/`
  - Static image files copied as-is
- `static/js/script.js`
  - Client-side behavior (palette mode, copy buttons, reading progress)

## Shortcodes in Active Use
Located in `themes/hugo-simple/layouts/shortcodes/`:
- `img.html`
- `figure.html`
- `centered-image.html`
- `canvas.html`

Image shortcodes support size presets:
- `xs`, `sm`, `md`, `lg`, `xl`, `full`

## Machine-Readable Endpoints
Configured outputs include HTML/RSS/JSON for home and sections.

Important endpoints:
- `/index.xml` (RSS)
- `/index.json` (site JSON index)
- `/blog/index.json` (blog section JSON index)
- `/status.json` (current project status for external services)
- `/llms.txt`
- `/llms-full.txt`

## Site Configuration
Primary config file: `hugo.toml`

Notable settings:
- `params.canonicalBaseURL`
- `params.description`
- `params.social` (footer social links)
- `params.comments` (Giscus settings: repo/repoId/category/categoryId)
- output formats for home/section JSON

## Quick Edit Map
- Change homepage pinned posts: `content/_index.md` (`start_here`)
- Change homepage status component content: `content/_index.md` (`now_title`, `now_focus`, `now_eta`)
- Change homepage momentum component logic: `themes/hugo-simple/layouts/partials/momentum_blurb.html`
- Change homepage layout/order: `themes/hugo-simple/layouts/index.html`
- Change `/blog/` main hub card layout: `themes/hugo-simple/layouts/blog/list.html`
- Change article comments behavior: `themes/hugo-simple/layouts/partials/comments.html` and `hugo.toml` (`[params.comments]`)
- Change footer social links: `hugo.toml` -> `[[params.social]]`
- Change breadcrumbs behavior: `themes/hugo-simple/layouts/partials/breadcrumbs.html`
- Change series pages/layout: `themes/hugo-simple/layouts/series/`
- Change archive behavior/style: `themes/hugo-simple/layouts/archive/list.html` and `themes/hugo-simple/assets/style.css`
- Change global visual style: `themes/hugo-simple/assets/style.css`

## Notes
- `themes/` contains the active theme source; most UI edits happen there.
- `public/` is generated output and should not be edited manually.
- Draft/publish scripts enforce front matter and asset sanity checks before publishing.
