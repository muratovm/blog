# Publishing Checklist

Use this checklist before setting `draft = false` and publishing a post.

## Content Quality
- Title is clear and specific.
- First paragraph explains the core point.
- Sections use descriptive headings.
- Claims have links or evidence where needed.

## Metadata
- `description` is one sentence and explains why the post matters.
- `tags` are relevant and not overly broad.
- `slug` is concise and URL-friendly.
- `lastmod` matches the latest meaningful edit date.

## Media and UX
- `image` exists in `assets/banners/`.
- Images in content have clear alt text where appropriate.
- Code blocks render correctly and are readable.

## Technical Checks
- Run `npm run check:posts`.
- Run `npm run check:drafts`.
- Run `npm run check:assets`.
- Run `npm run check:strict`.
- Run `npm run build:site`.
- Run `npm run weekly` and spot-check the page in preview.

## Final Publish
- Set `draft = false`.
- Re-run `npm run check:strict` for final validation.
