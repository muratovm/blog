# Design Report

A living document describing the visual identity, interaction patterns, and design philosophy of my personal style system.

---

## Design Philosophy

My style follows a **minimal, content-first** aesthetic. The design stays out of the way — no gratuitous color, no heavy animations. Decorative elements exist only where they signal something real (the activity grid signals ambient work; the reading progress bar signals depth). Every pixel either serves readability or earns its place.

The guiding principle: **quiet confidence.** The content speaks; the design amplifies it without competing.

---

## Visual Identity

### Color System

All colors are defined as CSS custom properties and toggle between light and dark palettes via a `.dark-mode` class. The palette centers on **teal** as the primary accent, with warm off-white backgrounds and sage green borders.

| Role | Light | Dark |
|------|-------|------|
| Background (`--bg`) | `#ffffff` | `#0e1718` |
| Card surface (`--accent-bg`) | `#f6f4ef` (warm off-white) | `#182627` |
| Primary text (`--text`) | `#1f2d2c` (near-black, teal undertone) | `#d9e5e3` |
| Accent (`--accent`) | `#176b63` (deep teal) | `#79d2c2` (bright teal) |
| Borders (`--border`) | `#8f9d8a` (muted sage) | `#4a605d` |
| Code/alert (`--code`) | `#9d2e5d` (berry) | `#ff9ec3` (pink) |
| Highlight (`--marked`) | `#ffd76a` (warm gold) | `#b47828` |
| Disabled (`--disabled`) | `#ededec` (calculated 8% alpha) | `#1c2628` (calculated 8% alpha) |
| Disabled Text (`--disabled-text`)| `#96a1a0` (muted) | `#546664` (muted) |
| Success (`--success`) | `#2b8a4b` | `#85d6a3` |
| Warning (`--warning`) | `#d68910` | `#f39c12` |
| Critical (`--critical`) | `#d35400` | `#e74c3c` |
| Error (`--error`) | `#b22b2b` | `#f88b8b` |

*Note: Component opacities (e.g., hover backgrounds, status labels) are derived natively using `color-mix(in srgb, var(--token) X%, transparent)` rather than hardcoding RGBA formulas.*

### Typography

Two typefaces create a clear visual hierarchy:

- **Literata** (serif) — headings and titles. Weight 700–800. Provides warmth and authority.
- **Atkinson Hyperlegible** (sans-serif) — body text, labels, metadata. Designed for maximum readability and accessibility.
- **Consolas/Menlo** (monospace) — code blocks, agent avatars, terminal references.

### Type Scale

| Element | Size |
|---------|------|
| `h1` | 3rem |
| `h2` | 2.6rem |
| `h3` | 2rem |
| `h4` | 1.44rem |
| Body | 1.1rem |

Headings scale down on mobile (breakpoint: 720px) — h1 to 2.5rem, h2 to 2.1rem, h3 to 1.75rem.

---

## Layout & Structure

### Homepage

The homepage is two-column: a main feed on the left and a "Previous Posts" sidebar on the right. The main feed leads with a **Status + Momentum blurb** (In Progress work, days since last update, publish count, sparkline), then a featured post, a pinned section, and two parallel content tracks — **Stories** and **Artifacts** — each showing the three most recent entries. A recent activity list and archive link close the main column.

- **Stories** — narrative posts: longer reads, field notes, build logs, opinions
- **Artifacts** — technical output: guides, tools, reference material, structured write-ups

The two-track model keeps intent clear at a glance. Readers who want prose go left; readers who want reference go right.

### Post Pages

Single articles use a centered reading column with an optional sticky **Table of Contents** panel that floats to the right for longer pieces (`toc: true` in frontmatter). A reading progress bar runs along the top of the viewport. **Breadcrumbs** appear above the content (e.g. Home / Blog / Artifacts / Builds / Post Title).

### List Pages

Archive, Stories, and Artifacts indexes present posts as a flat chronological list. Minimal metadata per entry: date, title, reading time. No thumbnails, no excerpts — the title does the work.

### Page Width

Content is constrained to `max-width: 40rem`, centered. The site header stretches to `max-width: 1200px` to accommodate the activity grid decorations. This creates a tight, focused reading column while allowing the header to breathe at full width.

### Spacing System

All spacing uses multiples of 8px. Section separators use 24px margins. The overall feeling is tight but breathable.

---

## Interaction Patterns

### Activity Grid

Both sides of the site header contain an animated dot-grid decoration — 12×12 cells cycling on a 2.6-second interval. It's purely visual, never interactive, and creates the impression of ambient system activity without competing with content. In dark mode the grid shifts to a blended teal-background tone (`--grid-dark-accent`).

### Reading Progress Bar

Article pages display a 3px teal bar pinned to the top of the viewport that fills as the reader scrolls. It carries a soft glow:

```css
#reading-progress {
    height: 3px;
    background: var(--accent);
    box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 40%, transparent);
    transition: width 0.08s linear;
}
```

The transition is intentionally fast (80ms) to feel responsive rather than decorative.

### Heading Permalinks

Every heading renders a 🔗 copy-link button on hover. Clicking copies the anchor URL to the clipboard. Invisible at rest — surfaces only on heading hover to avoid visual clutter.

### Hover Behavior

Cards use a **flat hover** pattern — only the border color shifts on hover. No raise transforms, no glowing box-shadows. This was a deliberate choice to reduce visual noise and keep the interface calm.

```css
.card:hover {
    border-color: var(--accent-hover);
    /* No transform. No box-shadow. */
}
```

Homepage cards use per-section accent colors on hover, creating subtle visual variety without breaking consistency.

### Page Load Animation

A subtle slide-up entrance animation fires on every page load:

```css
@keyframes slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
}

nav, header, main, footer {
    animation: slideUp 0.3s ease-out both;
}
```

No staggered delays — all elements animate together to avoid perceived loading lag.

### Dark/Light Mode

Every page supports both modes via a floating toggle button (`🌙` / `☀️`) fixed to the top-right corner of the viewport, independent of the nav. State is persisted in `localStorage` and respects system preference on first visit. All colors reference CSS variables so the entire palette swaps cleanly. Images in dark mode receive a filter (`brightness(0.82) contrast(1.08) saturate(1.05)`) to compensate for the dark background without requiring separate assets.

### Search

A live search input is accessible from the header nav (magnifier icon). Results appear in a dropdown as the user types, showing post title and metadata. No page reload required.

---

## Banners

Post banner images are 1200×675 (16:9). The theme applies `brightness(0.82) contrast(1.08) saturate(1.05)` in dark mode — design for that filter from the start.

### Palette

Pull directly from CSS variables — no new colors:

| Role | Value | Use |
|------|-------|-----|
| Background (light) | `#f6f4ef` | Primary bg for light-style banners |
| Background (dark) | `#0e1718` | Primary bg for dark-style banners |
| Accent | `#176b63` | Primary graphic/text color |
| Border | `#8f9d8a` | Secondary elements, outlines |
| Code/alert | `#9d2e5d` | Accent pops — sparingly |
| Highlight | `#ffd76a` | One element max |

### Composition

- One dominant visual idea — not a collage
- Abstract or conceptual — no stock photography
- Flat or very low-depth, consistent with the site's no-raise-no-glow philosophy
- Leave left margin clear for potential text overlay
- Fine grain or paper texture on warm off-white backgrounds works well
- Data visualization aesthetics (grids, graphs, dot patterns, waveforms) fit naturally

### Dark mode constraint

Avoid pure white backgrounds and very high contrast originals — the dark mode filter will push contrast further. Slightly muted originals survive better.

### Per-track conventions

| Track | Visual direction |
|-------|-----------------|
| Guides | Clean diagrams, monoline illustrations, terminal aesthetics |
| Builds | Architecture diagrams, isometric layouts |
| Notes | Typography-forward, sparse, document-like |
| Stories | Abstract, textural, mood-driven |

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Two content tracks (Stories / Artifacts) | Separates narrative intent from reference intent. Readers self-select without needing categories or tags. |
| Featured post leads the homepage | Surfaces the best current work immediately. Homepage is an editorial statement, not a feed. |
| Status + Momentum blurb on homepage | Makes in-progress work visible. The blog is a living system, not just an archive. |
| Activity grid in header | Signals ambient activity without cluttering the content area. Purely decorative — never interactive. |
| Flat hover (no raise/glow) | Reduces visual noise. The blog is for reading, not for demonstrating interactivity. |
| `max-width: 40rem` content column | Tighter than convention but optimised for the typefaces in use. Forces line lengths that read well at 1.1rem body size. |
| ToC as opt-in sidebar, not inline | Only long reference posts need navigation. Opt-in via frontmatter keeps shorter posts clean. |
| Reading progress bar with glow | Orientation aid for long posts. The glow adds presence without increasing bar height. |
| Heading permalinks hidden until hover | Useful for power users linking to sections; invisible to casual readers who don't need them. |
| AI Summarize at article bottom | Utility feature surfaced after the content, not competing with it. |
| Dark mode image filter | Prevents full-bleed images from appearing blown-out on dark backgrounds without requiring separate assets. |
| Comments via Giscus (GitHub) | Zero external service dependency beyond GitHub. Comments live where the code lives. |

---

## Technical Architecture

- **Static site generator:** Hugo with a custom theme (`muratov`). Content in Markdown, layouts in Go templates.
- **Stylesheet:** `simple.css` (base reset) + `style.css` (custom overrides), both minified at build time.
- **Content model:** Two post types — Stories (narrative) and Artifacts (technical) — distinguished by file path and optional `kind` frontmatter.
- **Syntax highlighting:** Catppuccin Mocha theme via Hugo's built-in Chroma highlighter. No JavaScript required.
- **Search:** Client-side via a JSON index Hugo generates at build time. Live results with no server round-trip.
- **Comments:** Giscus (GitHub Discussions). Zero third-party tracking. Reactions + threaded comments.
- **Related content:** Hugo's built-in related pages engine, weighted by tags (80) and series (120). Rendered as a 3-card thumbnail grid above comments.
- **Theme persistence:** `localStorage` with system preference fallback. Dark mode class applied before first paint to avoid flash.
- **Page transitions:** CSS `@keyframes` only. No JavaScript animation libraries.

---

*Last updated 2026-03-28. Verified by live browser inspection.*
