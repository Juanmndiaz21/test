---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: []
---

# Surface brief — Landing (app/page.tsx)

Scope and visitor mode: whole-site redirection exercise; landing is a **Persuade** surface, the storefront that must make the offer intelligible in the opening viewport.

Audience: competitive gamers who pay for rank climbs and in-game services — they want results, trust, and zero friction, not bargain pricing.

Job: prove the catalog is real and run the funnel (browse store → configure → checkout). Primary action: the search bar and every game tile → the store.

Proof/content: live catalog from the database (games + per-game service counts), honest how-it-works, transparency section, no invented claims.

Constraints: code-led build (no image generation), English copy, Rowmodz brand confirmed, dark violet palette, one orchestrated motion moment, contrast >= 4.5:1, the old lime/BOOST-PRO world is replaced, not polished.

Chosen direction: **Ranked Ladder** — the product IS the standings sheet; the catalog renders as a season leaderboard. Memorable moment: the standings rows rising on load, the top row drawn with the violet rank rule.

## Direction contract

THESIS: The landing is a quiet storefront with a real catalog: hero text, a wide game search, two honest grids (popular by real service count, then every game as a list row), features and reviews. It refuses the boost-shop default of a neon hero, a "book your booster" card, and decorative clipart tiles — every tile and price resolves to a real checkout page.

OWN-WORLD: night-violet ground (#120e1c), plum surfaces (#171229), hairline violet rules, one bright violet accent (#9d7cff) on near-black text; Impact condensed caps hero, quiet Trebuchet body, mono search bar and readouts. Cover-first tiles from `GameArt` (real image or generated division card).

STORY: A visitor reads a pitch in one line, types a game into the search bar, sees Popular and Browse-all grids of the real catalog, and understands the level-up value before reaching features and (sample-labeled) reviews. The survey CTA is the search bar and every tile.

FIRST VIEWPORT: big caps thesis "CLIMB THE RANK. SKIP THE GRIND." with a violet span, subhead with an honest live-catalog line, then a full-width mono search bar; scrolling reveals "POPULAR GAMES" (cover tiles) and "BROWSE ALL GAMES" (hairline rows), then "EVERYTHING YOU NEED TO LEVEL UP" and "REVIEWS" (sample-labeled).

FORM: Storefront search-led catalog, derived from the surface roll seed key 9176dfac (user's later structure decision).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
