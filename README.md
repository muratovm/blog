# Blog

## Current State
This site is a Hugo blog (`hugo v0.155+`) using the local theme at `themes/muratov`.

It is set up for:
- Weekly publishing from a draft-first workflow (`content/drafts` -> `content/blog`)
- A story/artifact-first publishing model
- A transition-ready content model for narrative `Stories` and raw `Artifacts`
- Nested artifact lanes (`Builds`, `Guides`, `Notes`) under `Artifacts`
- A custom homepage layout with pinned posts, recent activity, and recently updated content
- A custom `/blog/` hub page focused on `Stories` and `Artifacts`
- Machine-readable outputs for feeds and LLM ingestion (`index.json`, `llms.txt`)
- A machine-readable project status endpoint sourced from homepage front matter (`/status.json`)

## Recent Tweaks
- Moved `Builds`, `Guides`, and `Notes` content folders under `content/blog/artifacts/`
- Updated artifact-type navigation to route to section pages instead of filtering inline:
  - `/blog/artifacts/builds/`
  - `/blog/artifacts/guides/`
  - `/blog/artifacts/notes/`
- Removed duplicate artifact UI controls on `/blog/artifacts/` (kept section-link buttons, removed redundant filter dropdown)
- Added backward-compatible aliases for legacy URLs under `/blog/builds/`, `/blog/guides/`, and `/blog/notes/`
- Updated TryHackMe article taxonomy to use `thm` labels
- Added global header corner activity grids (static seeded state, no live animation), including mobile rendering
- Added a homepage `Momentum` component with 7-day counters + 8-week sparkline
- Reduced `Latest Feature` card height to keep top-of-home content visible with new status widgets
- Improved small-screen related content cards to use full column width
- Added a dedicated `/search/` page with client-side search powered by Hugo `/index.json`
- Added random prepopulated search suggestions + reroll button on the search page
- Moved search entry to the header icon navigation
- Added footer-level `Summarize page with AI` controls (ChatGPT / Gemini / Claude icons)
- Added click-to-copy prompt feedback box under AI icons (shows exact copied prompt)
- Added provider-specific URL handling (`%s` prompt, `%u` page URL, `%t` title), with Gemini copy/paste fallback guidance
- Updated footer spacing to `24px` top and bottom
- Enabled per-article comments with Giscus (GitHub Discussions-backed)
- Added duplicated top-of-article series navigation and a `Jump to Start` action in the series nav header
- Ongoing custom palette and interaction tuning lives in:
  - `themes/muratov/assets/style.css`
  - `themes/muratov/assets/simple.css`
  - `static/js/script.js`

## Stack
- Hugo (extended)
- Theme: local `themes/muratov`
- Node scripts (optional but used for workflow commands)

## Local Development
- Start local server: `npm run dev`
- Build production output: `npm run build:site`
- Output directory: `public/`

Local server is pinned to:
- `http://127.0.0.1:1313/`

## Article Workflow
- Create draft bundle: `npm run new:article -- <slug>`
- Create story draft bundle: `npm run new:story -- <slug>`
- Create artifact draft bundle: `npm run new:artifact -- <slug>`
- Publish draft: `npm run publish:article -- <draft-slug-or-path>`
- Validate published posts: `npm run check:posts`
- Validate draft rules: `npm run check:drafts`
- Validate image references: `npm run check:assets`
- Full strict gate: `npm run check:strict`
- Weekly flow: `npm run weekly`

## Content Structure
- `content/_index.md`
  - Home metadata + curated `start_here` slugs
- `content/blog/stories/`
  - Published narrative stories (high-impact writing target)
- `content/blog/artifacts/`
  - Published raw notes/experiments/reference material
  - `content/blog/artifacts/[builds]/` -> `/blog/artifacts/builds/`
  - `content/blog/artifacts/[guides]/` -> `/blog/artifacts/guides/`
  - `content/blog/artifacts/[notes]/` -> `/blog/artifacts/notes/`
- `content/drafts/`
  - Draft posts only (`draft: true` before publish)
- `content/archive/_index.md`
  - Archive landing content
- `content/search/_index.md`
  - Dedicated search page metadata
- `content/about.md`, `content/activity.md`
  - Static top-level pages

Transition model:
- `kind: story` drafts publish to `content/blog/stories/` by default
- `kind: artifact` drafts publish to `content/blog/artifacts/`
- `publish_section` front matter controls final destination (`stories`, `artifacts`, or legacy `blog`)
- Legacy top-level section URLs still resolve via aliases:
  - `/blog/builds/` -> `/blog/artifacts/builds/`
  - `/blog/guides/` -> `/blog/artifacts/guides/`
  - `/blog/notes/` -> `/blog/artifacts/notes/`

## Theme/Layout Ownership
- `themes/muratov/layouts/index.html`
  - Home page layout structure
- `themes/muratov/layouts/blog/list.html`
  - Custom main blog list page (`/blog/`) layout and card-based `Stories`/`Artifacts` navigation
- `themes/muratov/layouts/archive/list.html`
  - Archive page rendering (grouped chronologically)
- `themes/muratov/layouts/series/terms.html`
- `themes/muratov/layouts/series/taxonomy.html`
  - Series index and term page rendering
- `themes/muratov/layouts/_default/single.html`
- `themes/muratov/layouts/_default/blog-post.html`
  - Article templates, related-content fallback, and top/bottom series navigation with jump-to-start action
- `themes/muratov/layouts/partials/breadcrumbs.html`
  - Breadcrumb navigation (rendered globally for non-home pages)
- `themes/muratov/layouts/partials/nav.html`
  - Global header nav
- `themes/muratov/layouts/partials/side_nav.html`
  - Header icon navigation (home, posts, search, up-level)
- `themes/muratov/layouts/search/list.html`
  - Search page template and results mount
- `themes/muratov/layouts/partials/footer.html`
  - Footer + social links rendering + AI summarize controls
- `themes/muratov/layouts/partials/ai_assist.html`
  - Reusable AI summarize controls (provider buttons + feedback box)
- `themes/muratov/layouts/partials/status_blurb.html`
  - Reusable homepage status/in-progress component
- `themes/muratov/layouts/partials/momentum_blurb.html`
  - Reusable homepage momentum component (7-day metrics + 8-week trend)
- `themes/muratov/layouts/partials/comments.html`
  - Reusable article comments component (Giscus)
- `themes/muratov/layouts/index.status.json`
  - Dedicated machine-readable project status output
- `themes/muratov/assets/style.css`
  - Site-level custom styling

## Assets
- `assets/banners/`
  - Banner images used by front matter `image`
- `static/img/`
  - Static image files copied as-is
- `static/js/script.js`
  - Client-side behavior (palette mode, copy buttons, reading progress)
  - Also includes search runtime, AI summarize prompt generation, and provider URL token handling

## Shortcodes in Active Use
Located in `themes/muratov/layouts/shortcodes/`:
- `img.html`
- `figure.html`
- `centered-image.html`
- `canvas.html`
- `mermaid.html`
- `chart.html`

Image shortcodes support size presets:
- `xs`, `sm`, `md`, `lg`, `xl`, `full`

Visual shortcode notes:
- `mermaid.html` renders native Mermaid diagrams from shortcode body content
- `chart.html` renders Chart.js charts from inline JSON config (`config` param or shortcode body)
- `figure.html` supports optional `source` and `sourceLink` metadata for scientific/technical references

### Diagrams and Charts
- Mermaid diagrams:
```md
{{< mermaid caption="System flow" >}}
flowchart LR
  A[Idea] --> B[Draft]
  B --> C[Publish]
{{< /mermaid >}}
```
- Chart.js charts:
```md
{{< chart id="trend-sample" height="240" caption="Weekly trend" >}}
{
  "type": "line",
  "data": {
    "labels": ["W1","W2","W3","W4"],
    "datasets": [{ "label": "Edits", "data": [1,2,3,2] }]
  },
  "options": { "responsive": true, "maintainAspectRatio": false }
}
{{< /chart >}}
```

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
- Change homepage momentum component logic: `themes/muratov/layouts/partials/momentum_blurb.html`
- Change homepage layout/order: `themes/muratov/layouts/index.html`
- Change `/blog/` main hub card layout: `themes/muratov/layouts/blog/list.html`
- Change article comments behavior: `themes/muratov/layouts/partials/comments.html` and `hugo.toml` (`[params.comments]`)
- Change Mermaid/Chart rendering runtime: `static/js/script.js`
- Change visual shortcode presentation styles: `themes/muratov/assets/style.css`
- Change search page layout: `themes/muratov/layouts/search/list.html`
- Change search indexing fields: `themes/muratov/layouts/_default/index.json`
- Change footer AI summarize module: `themes/muratov/layouts/partials/ai_assist.html` and `themes/muratov/layouts/partials/footer.html`
- Change footer social links: `hugo.toml` -> `[[params.social]]`
- Change breadcrumbs behavior: `themes/muratov/layouts/partials/breadcrumbs.html`
- Change series pages/layout: `themes/muratov/layouts/series/`
- Change archive behavior/style: `themes/muratov/layouts/archive/list.html` and `themes/muratov/assets/style.css`
- Change global visual style: `themes/muratov/assets/style.css`

## Notes
- `themes/` contains the active theme source; most UI edits happen there.
- `public/` is generated output and should not be edited manually.
- Draft/publish scripts enforce front matter and asset sanity checks before publishing.
