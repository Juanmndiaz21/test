---
name: OGmodz
description: Competitive boosting marketplace as a live rank standings sheet — night-violet, one bright violet accent, standings caps with tabular readouts.
colors:
  primary: "#9d7cff"
  neutral-bg: "#120e1c"
  surface: "#171229"
  surface-deep: "#0d0914"
  text: "#f1ecfb"
  text-muted: "#94a3b8"
  border: "rgba(157, 124, 255, 0.16)"
  danger: "#f87171"
typography:
  display:
    fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
    fontSize: "clamp(3rem, 9vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "0.02em"
  headline:
    fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "0.02em"
  title:
    fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 900
    lineHeight: 1.25
  body:
    fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.7rem"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "0.18em"
    fontFeature: '"tnum"'
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#0d0914"
    rounded: "{rounded.sm}"
    padding: "1rem 1.75rem"
    typography:
      fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif"
      fontWeight: 900
      textTransform: "uppercase"
      letterSpacing: "0.05em"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "1rem 1.75rem"
    typography:
      fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif"
      fontWeight: 700
      textTransform: "uppercase"
      letterSpacing: "0.05em"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "1.75rem"
  input:
    backgroundColor: "rgba(0, 0, 0, 0.2)"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "12px"
---

# Design System: OGmodz

## Overview

**Creative North Star: "The Season Standings"**

OGmodz sells climbs, so the system renders the whole product as a competitive season standings sheet. Every surface borrows its grammar from the broadcast of a ranked tournament: the catalog is a live leaderboard ranked by the number of real services it carries, prices and boost amounts sit in tabular mono readouts like rating figures, and a match-detailed panel — the standings, the config slip, the promotion slip — carries each step of the funnel.

The material world is a rank arena at night: deep night-violet ink, plum surfaces, and hairline violet rules, with exactly one saturated accent — Promotion Violet — reserved for the act of climbing. Condensed Impact caps shout the standings; quiet Trebuchet body reads the guidance; the mono face speaks the numbers. Movement is sparse and deliberate: the ladder rows rise on load and the leader row draws its violet rule, then the page rests. The old lime-and-near-black "boosting shop" world is replaced, never polished.

**Key Characteristics:**
- One accent color, used only for the climb (CTAs, active ranks, focus, selected states).
- The catalog is real data, rendered as standings — position, cover, game, entry track, entry count.
- Condensed caps for hierarchy, quiet body for guidance, tabular mono for figures.
- Violet-tinted hairline separators instead of heavy borders.
- One orchestrated entrance motion per page, never scattered effects.

## Colors

The palette is a night arena: violet-inks for ground and surfaces, one bright violet for action, lavender whites for text. Nothing drifts back to green-tinted or blue-black greys.

### Primary
- **Promotion Violet** (#9d7cff): the single saturated accent. Fills the primary action ("View the ladder", "Add configuration"), marks the leader position and focused/selected states, and tints the caret, selection, focus outlines and scrollbar. Always pairs with near-black ink text; never with grey text on top of it.

### Neutral
- **Night Violet** (#120e1c): the page ground.
- **Plum Surface** (#171229): the raised surface for cards, panels, standings framing, select fields, and admin chrome.
- **Ink Violet** (#0d0914): the recessed ground behind the sticky header and footer and the text used on violet fills.
- **Iced Lavender** (#f1ecfb): primary text.
- **Mist Slate** (#94a3b8): secondary/muted text. The floor for muted-text contrast on the violet grounds — nothing weaker than this shade on a ground; brighter or equal if the block is small.
- **Violet Hairline** (rgba(157, 124, 255, 0.16)): every border and divider.
- **Match Abandon Red** (#f87171): destructive admin actions, error accents and toasts only.

### Named Rules
**The Promotion Violet Rule.** Exactly one saturated accent in the whole system: #9d7cff, spent only on the act of climbing — primary actions, the leader position, focus and selection. No second accent color, no green money, no yellow payment chips, no violet gradients.

**The Night-Scene Rule.** "Dark" here is a scene, not a default: the ground is always the night-violet ink family (#120e1c / #171229 / #0d0914). Whenever a grey reads greenish or blue-black — a throwback to a previous grey-on-black world — it is the wrong grey; shift it toward the plum family.

## Typography

**Display Font:** Impact (fallback Haettenschweiler, "Arial Narrow Bold")
**Body Font:** Trebuchet MS (fallback Segoe UI)
**Label/Mono Font:** ui-monospace / SFMono-Regular / Menlo / Consolas

**Character:** The pairing is a standings broadcast — loud condensed caps for the hierarchy, a calm humanist body for the guidance, and a technical mono for the figures. Caps say "standings", body says "read this", mono says "these numbers are exact".

### Hierarchy
- **Display** (Impact 400, clamp(3rem→6rem), lh 0.9): the landing thesis ("CLIMB THE RANK."), section statements. Uppercase; never longer than one clause so the weight stays loud.
- **Headline** (Impact 400, clamp(2.25rem→3.75rem), lh 0.95): section titles like "HOW PROMOTIONS WORK", "READY TO CLIMB?".
- **Title** (Trebuchet 900, 20px, lh 1.25): card titles, config panel headings, product names in listings.
- **Body** (Trebuchet 400, 16px, lh 1.6, max ~65ch): paragraphs, descriptions, cart entries.
- **Label** (mono 800, 11px, lh 1.3, ls 0.18em, uppercase): eyebrows and tracked categories — "SEASON 01", "PRODUCT CONFIG", platform eyebrows. Also the **data-readout** form (tabular-nums, ls 0.08em, 11–14px) for every figure: prices, entries, positions, boost amounts.

### Named Rules
**The Tabular-Figure Rule.** Every number is a rating readout: tabular mono (`font-variant-numeric: tabular-nums`, 0.08em tracking). Prices, entry counts, positions and boost amounts never render in the humanist body face.

## Layout

The page grid is a centered max-w-7xl column with one- and two-column top-level bands. The landing is a storefront stack: a hero text block, a wide search bar, then two game grids — "Popular games" (tiles ranked by real service count, cover-first) and "Browse all games" (hairline list rows with mode pill and entry count) — followed by the features band, the reviews, and the site footer. Vertical rhythm spaces 80px (py-14/16/20/24 mix) with more air above a heading than below it; a dense catalog block earns quiet sections after it.

Section eyebrows are a small mono violet label (`.eyebrow`) above the main heading — an inherited pattern on store and admin surfaces. The standings and tables communicate through hairline rows with generous 20px horizontal padding; the leader row gets a violet-tinted wash and a violet rule runs down its inside edge.

## Elevation & Depth

Depth is tonal layering over shadows. Surfaces sit in three stacked tones of the same violet family — Ink Violet (recessed), Night Violet (ground), Plum Surface (raised). Lifted panels use a single ambient shadow (`0 24px 70px rgba(0,0,0,0.35)`) with a `1px` violet hairline border; nothing glows, nothing floats high. Hover raises borders from the hairline toward the accent (`.hover:border-lime-300/50`) instead of adding shadow or scale.

## Shapes

Corners are gently rounded: inputs and buttons at 8px, menus and panels at 12px, large cards at 16px. Separations are always the hairline (1px, violet-tinted); corner rounding and hairline rules stand in for ornament. Avatars and game covers are rounded square; no shadows behind them.

## Components

### Buttons
- **Shape:** 8px radius, uppercase label, 900 weight.
- **Primary:** Promotion Violet fill with Ink Violet text (px-7/8 py-4); hover lightens the violet (`hover:bg-lime-200`); the star of every surface. Appears in pairs ("View the ladder", "Add configuration", "Save changes").
- **Ghost:** 1px hairline border in violet at ~30% opacity, Iced Lavender text; on hover the border and text take the accent.
- **Focus:** 2px solid accent outline, 3px offset, applied to every interactive element.

### Cards / Containers (panel-surface, card)
- **Corner Style:** 16px (large), 12px (small controls/menus).
- **Background:** Plum Surface at ~90% over the ground; the standings sheet and checkout panels use it.
- **Border:** 1px violet hairline.
- **Shadow:** the single ambient panel shadow only.
- **Internal Padding:** p-7/p-8 at rest, p-4 for the dense standings rows, or p-10/14 for hero panels.

### Inputs / Fields
- **Style:** near-black translucent fill over the panel (`rgba(0,0,0,0.2)`), 1px faint white border, 8px radius, 12px padding.
- **Focus:** border shifts to the accent violet with the global accent outline.
- **Read-only:** accent violet text (game field locked to a category), `cursor-not-allowed`.

### Navigation
Sticky header of Ink Violet at 90% with a 1px hairline bottom border; wordmark is Impact caps ("OGMODZ"), links are muted lavender with accent violet hover. The profile menu floats a Plum 12px panel with hairline rows, a violet highlight on the admin entry, and violet-fill hover states where the accent keeps its black text. Admin uses a fixed flex sidebar in Plum with a hairline right border.

### Label / Chips
"Available"-style status chips are a 1px accent-border pill, 11px label weight, at low intensity (20% border, 1px). The "Sign Up"/"Add to cart" feel of dense chips belongs to the primary-button system.

### The Landing Catalog (storefront grids)
The landing's front door to the catalog, pinned right after the hero. A wide mono search field (near-black fill, accent border on focus) filters both grids live from one client state. "Popular games" is a cover-first tile grid (2-3 columns) of `GameArt` cards ranked by real service count descending; "Browse all games" is a Plum panel of hairline list rows — cover thumb, game name, entry count and mode pill (`MP + SP` / `Multiplayer` / `Singleplayer`), and an "OPEN" arrow. `games.mode` (`both` / `multiplayer` / `singleplayer`) is a real catalog column; filters never fabricate counts, and an empty query state reads "No results".

### Game Category Editing (admin)
The catalog admin on each game page ("Edit category") is a modal that edits name, mode, and image URL through a single server action (`updateGameCategory`): renaming a category also re-points its services (a real `products.game` follow update), and any change clears the store caches. The image field is optional — leaving it empty keeps the generated cover art from `GameArt`.

### FAQ (product answers accordion)
Product pages use a `<details>` accordion for FAQs. Each row is a hairline-separated summary (Title 20px) with a circular ghost "+" toggle that rotates 45° when open; the answer body sits on the open state in Body face. Answers are honest product copy — the demo checkout records orders without processing real payments, and the catalog copy says so.

## Do's and Don'ts

### Do:
- **Do** keep every muted text at or brighter than Mist Slate (#94a3b8) when it sits on a violet ground — the contrast floor is 4.5:1.
- **Do** render positions, prices, counts and boost amounts in the tabular mono readout.
- **Do** spend the Promotion Violet accent only on climbing actions and the leader position; keep its paired text near-black for contrast.
- **Do** separate blocks with the violet hairline and generous padding; let the night-violet family carry the scene.
- **Do** author numbers honestly from the catalog — the standings show real counts, never invented ranks or player counts.
- **Do** give interactive elements the global accent focus outline.

### Don't:
- **Don't** reintroduce a second accent (no lime, no payment gold, no money-green prices).
- **Don't** put grey text on a violet fill unless it flips to near-black on hover.
- **Don't** use unicode glyph icons — draw inline SVGs (check, cross, pencil, chevron); the "×" close/remove button and the "−"/"+" steppers are text, not icons.
- **Don't** add neon glow, text shadows, shimmer, or gradient text; depth is tonal layering, not light effects.
- **Don't** drift the ground back to grey-on-black or green-black; Night Violet is the scene.
- **Don't** render the standings as decoration — the ladder is the live catalog and the funnel's front door.