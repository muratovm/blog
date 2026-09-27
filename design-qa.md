# Editorial homepage styling

Reference: `/tmp/codex-remote-attachments/01a0bcc9-81f9-7713-8170-75dd8e8b6fb9/BE19E0F2-8662-474B-9656-13DABFD13071/1-Photo-1.jpg`

The reference styling applies to the homepage. About uses only its compact header, with a 30px desktop title (25px on mobile), no subheading, and a left edge aligned with the body content; its page content and breadcrumbs retain their earlier styling. Search, the blog archive, Stories, Artifacts, and article pages use their earlier page styling. Articles with a table of contents use the original two-column layout and sticky contents panel at 1200px and wider.

Hugo production build passed (120 pages). Browser measurements confirmed About's title and body share the same left edge at 320px, 390px, 768px, 1024px, and 1440px, with no horizontal overflow. The updated About page is served through Tailscale with HTTP 200. A blog article has an 800px reading column beside a 320px sticky contents panel at 1200px, and a single column without horizontal overflow at 390px.

Automated browser measurements verified layout bounds. A reliable screenshot capture was unavailable, so visual comparison remains unverified.

final result: layout bounds verified; visual comparison pending
