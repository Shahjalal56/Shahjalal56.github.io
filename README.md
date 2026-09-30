# Md Shahjalal — Flutter Developer Portfolio

A single-page portfolio site. Plain HTML, CSS and JavaScript — no build step,
no dependencies, no framework. Drop it on any static host and it runs.

## Design

**One codebase, two platforms** — that's the palette rationale. It's
black-dominant, and the only two accents are the platforms the work ships to:

| Token        | Hex       | Meaning                    |
| ------------ | --------- | -------------------------- |
| `--void`     | `#08090A` | page base                  |
| `--slab`     | `#0E1113` | elevated surface           |
| `--droid`    | `#3DDC84` | Android brand green        |
| `--droid-d`  | `#01875F` | Play Store install green   |
| `--ios`      | `#0A84FF` | iOS system blue            |
| `--chalk`    | `#ECF1F3` | primary text               |
| `--fog`      | `#8A969C` | secondary text             |
| `--bad`      | `#FF6B5B` | invalid form field — state, not an accent |

Type: **Bricolage Grotesque** (display) · **Instrument Sans** (body) ·
**JetBrains Mono** (labels and data).

**Signature element** — the Work grid. Each card is a shipped app, and its
platform badges *are* the store links: tap Android, iOS or Web and you land on
the live listing. Nothing on the card is decorative.

**3D cards** — the Work and Stack cards tilt toward the pointer. The card sets
`transform-style: preserve-3d` and its contents sit on real `translateZ` planes,
so the tilt reads as depth rather than a skew. `main.js` writes `--rx`, `--ry`,
`--mx` and `--my` on `pointermove` (throttled to one frame); CSS does the rest.

Two things to know before editing those cards:

- Do **not** add `isolation`, `overflow`, `filter`, `opacity` or `contain` to
  `.proj__i` / `.grp` — each of those silently forces `preserve-3d` back to
  `flat`, and the depth disappears with no error.
- The cards also carry `.rv` (scroll reveal). The reveal contributes its offset
  as the `--rv-y` custom property instead of its own `transform`, so the two
  don't cancel each other out. Keep it that way.

The tilt is skipped entirely for `prefers-reduced-motion` and for
non-mouse pointers.

The hero includes orbiting lights, a moving gradient headline and drifting
particles. Scroll reveals are staggered across the grids; statistics count up
once, buttons respond to the pointer, and a top bar shows reading progress.
`assets/js/motion.js` manages these enhancements without dependencies. The
navigation's Motion button pauses effects and remembers the visitor's choice.
System reduced-motion preferences are respected, ambient animations pause in
background tabs, and content remains visible when JavaScript is unavailable.
When changing CSS or JavaScript, update their version query strings in
`index.html` so returning visitors receive the latest assets.

## Files

```
index.html                  all markup and copy
assets/css/styles.css       every style, one file
assets/js/main.js           nav, reveals, marquee, mail handoff, card tilt
assets/img/shahjalal.webp   headshot used by the site (111 KB)
assets/img/shahjalal.png    same cutout, transparent PNG — reuse for CV/LinkedIn
assets/img/og-card.png      1200x630 link preview for LinkedIn/WhatsApp/X
assets/Md-Shahjalal-...pdf  CV served by the "Download CV" button
tools/make_og_card.py       regenerates og-card.png (needs Pillow)
.claude/launch.json         local preview config
```

## Link preview

`assets/img/og-card.png` is what LinkedIn, WhatsApp, Slack and X show when the
URL is shared. Two things to know:

- `og:image`, `og:url` and `canonical` in `index.html` are **absolute URLs**, and
  they have to be — a relative `og:image` shows no preview at all. They point at
  `https://shahjalal56.github.io/`. Deploying to a project subpath or a custom
  domain instead? Change all of them.
- To change the card's copy, edit `tools/make_og_card.py` and re-run it. It
  builds the card from the site's own palette and the transparent headshot.

## Run locally

```bash
python -m http.server 5580
```

Then open <http://localhost:5580>. Open `index.html` directly and it also works,
though the CV download behaves better over HTTP.

## Deploy to GitHub Pages

To publish at `https://<username>.github.io` — the same shape as the reference
site — name the repository exactly `<username>.github.io`:

```bash
git init
git add .
git commit -m "Portfolio site"
git branch -M main
git remote add origin https://github.com/Shahjalal56/Shahjalal56.github.io.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Source: Deploy from a branch → main /
(root)**. It goes live in a minute or two.

For a project-subpath URL instead (`https://shahjalal56.github.io/portfolio`),
use any repo name — every path in this site is relative, so no config changes
are needed.

## Editing

- **Copy, projects, contact details** — `index.html`. Each project is one
  `<li class="proj__i">`: a `<h3 class="proj__name">`, a `<p class="proj__desc">`,
  and a `.proj__meta` row of store links.
- **Colours and spacing** — the `:root` block at the top of `styles.css`.
- **Adding a project** — copy an existing `<li>` and swap the name, description
  and hrefs. Use `plat--a` for Play, `plat--i` for the App Store, `plat--web` for
  a web build; drop the ones that don't apply. No JS changes needed.

## Notes

- **The contact form has no backend, and neither does "Hire me".** Both hand the
  message to `mailto:`, which only works if the device has a mail app registered
  for it. A fresh Windows install and most in-app browsers swallow that click
  silently — no navigation, no error. So `main.js` fires the `mailto:`, then
  checks whether the page actually lost focus. If it didn't, the hand-off failed
  and the `#mbox` dialog opens instead with an **Open in Gmail** link (works
  everywhere) and a **Copy message** button. That focus check only counts when
  the page had focus to begin with, otherwise it can't tell the two cases apart.
- **Only name and email are required.** The message field is optional, so a
  recruiter can send a one-liner. The form carries `novalidate` and shows its own
  `.fld__err` messages, because native validation bubbles don't render in every
  browser and a submit that appears to do nothing is worse than an error.
- To collect submissions server-side instead, point the `<form>` at Formspree,
  Getform or a Cloudflare Worker and delete block 4 of `main.js`.
- `prefers-reduced-motion` is respected — the marquee, the reveals and the card
  tilt all stop.
- Verified with no horizontal overflow from 320 px to 1440 px.
