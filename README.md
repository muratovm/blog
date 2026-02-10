# Blog

## Overview
This site is built with [Hugo](https://gohugo.io/) using the [hugo-simple](https://github.com/maolonglong/hugo-simple) theme. It serves as a template for a lightweight blog and showcases usage of the theme along with optional Tailwind based styling.

## Prerequisites
- **Hugo** `>=0.112.4`
- **Node & npm** (optional) – to install the dependencies listed in `package.json` for Tailwind and PostCSS tooling.
- **ripgrep (`rg`)** (optional, recommended) – used by validation scripts when available.

## Development
1. Install the prerequisites.
2. Run `npm run dev` to start a local development server at `http://127.0.0.1:1313` with a local `baseURL`.
3. Build the site for production by running `npm run build:site`. The generated files will appear in the `public/` directory.

## Article Workflow
- Create a new draft article bundle: `npm run new:article -- <slug>`
- Publish a draft into `content/blog`: `npm run publish:article -- <draft-slug-or-path>`
- Validate published posts: `npm run check:posts`
- Validate draft-only section rules: `npm run check:drafts`
- Validate image and banner references: `npm run check:assets`
- Run full release gate: `npm run check:strict`
- Production-style build check: `npm run build:site`
- Weekly flow (validate, build, then preview): `npm run weekly`
- Publishing checklist: `docs/publishing-checklist.md`

## Directory Structure
- `content/` – Markdown content for pages and posts.
- `static/` – Files copied directly to the output (images, fonts, etc.).
- `themes/` – Contains the bundled `hugo-simple` theme and other theme assets.
- `resources/` – Auto‑generated assets such as processed CSS.

## Quick Navigation
- `README.md` – Project overview, setup, and navigation.
- `hugo.toml` – Main Hugo site configuration.
- `content/_index.md` – Home page content entry point.
- `content/about.md` – About page content.
- `content/activity.md` – Activity page content.
- `content/blog/` – Published blog posts and section indexes only.
- `content/drafts/` – Work-in-progress drafts only (`draft: true` enforced).
- `assets/banners/` – Post banner images used across articles.
- `static/img/` – Static images served as-is.
- `static/js/script.js` – Custom client-side JavaScript.
- `themes/hugo-simple/` – Active theme source (layouts, partials, styles).
- `themes/hugo-simple/layouts/` – Hugo templates and shortcodes.
- `themes/hugo-simple/assets/` – Theme CSS/SCSS assets.
- `archetypes/default.md` – Default front matter template for new content.
- `scripts/new-article.sh` – Standardized command for creating new post bundles.
- `scripts/publish-article.sh` – Move a draft to published and set `draft: false`.
- `scripts/validate-posts.sh` – Front matter and banner validation for publish readiness.
- `scripts/validate-drafts.sh` – Enforces `draft: true` in `content/drafts`.
- `scripts/validate-assets.sh` – Checks markdown/shortcode/front matter image references.
- `scripts/weekly-workflow.sh` – Weekly command: validate, build, then run preview server.
- `docs/publishing-checklist.md` – Pre-publish editorial and technical checklist.
- `excalidraw/` – Diagram source files and related docs.

## Credits
- [Hugo ʕ•ᴥ•ʔ Simple Theme](https://github.com/maolonglong/hugo-simple)
- [Admonitions Styling](https://github.com/KKKZOZ/hugo-admonitions)

## License
This project uses the MIT license, matching the license of the hugo-simple theme.
