---
title: "Design To-Do"
draft: true
---

Design improvements identified from a live browser review on 2026-03-27. Work through these one by one.

---

## ~~1. Fix the About page~~ ✓ Done 2026-03-27

~~**Problem:** Clicking the site title ("Michael Muratov") in the header navigates to `/about/`, which currently shows: *"I scraped the about page. Working on fixing that but it'll need some time."* This is the highest-traffic destination on the site and it's a placeholder.~~

~~**Fix:** Write the About page.~~

---

## 2. Make the nav legible

**Problem:** Four unlabeled icon buttons. No way to know what they do on a first visit without hovering each one.

**Fix:** Add visible text labels on wider viewports, or at minimum ensure tooltips are present and descriptive on all icons. The home and blog icons are the most critical.

---

## ~~3. Retire the "Previous Posts" sidebar~~ ✗ Closed — keeping it

~~**Problem:** The right-hand "Previous Posts" column on the homepage is a dated pattern. The main feed already handles recency. The sidebar adds visual weight without adding value.~~

~~**Fix:** Remove the sidebar. Use the reclaimed horizontal space to widen the reading column, or leave it as breathing room.~~

**Decision:** The sidebar stays. It balances the two-column layout and gives a fast chronological glance at recent posts without scrolling the main feed.

---

## ~~4. Flesh out the blog list page~~ ✗ Closed — not needed

~~**Problem:** The `/blog/` page shows two sparse boxes (Stories, Artifacts) with three lines each. Not enough for a reader to understand the range or depth of the content.~~

~~**Fix:** Add 2–3 sentences of description to each track explaining what kinds of posts live there and who they're for.~~

**Decision:** The existing one-liner descriptions are sufficient. The cards do their job.
