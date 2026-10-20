# Vyrathen — Visual Direction v0.5 (approved 2026-10-20)

## Identity and boundary
Vyrathen is an independent **science-fantasy strategy RPG** for the browser: NOT the official sequel or a commercial distribution of historical Soulheroes assets. Preserve verified mechanics as documented; worldbuilding, sprites, illustrations, logos and UI must be original. Design **desktop-first**, with mobile adaptation later and no avoidable accessibility debt.

## Core blend: APPROVED
- **Neon Elegance:** structure, dark graphite/navy surfaces, clean layout, restrained atmosphere, readable text and premium spacing.
- **Cyberpunk Expression:** lively graphic character, bolder diagonal shapes, high-contrast white/black accents, expressive typography, assertive kinetic motion and per-character accent palettes.
- **Arcane Cyberpunk:** SPECIAL VFX layer (energy, geometric glyphs, spectral motifs, meaningful rewards/abilities), not the everyday UI chrome.

Do not copy distinctive artwork, layout, logos, character designs, icons, licensed fonts, shaders, footage or audio from ZZZ, WUWA, HSR or NTE. Use those games for qualitative design principles only.

## Art direction and layout
- **Hybrid art:** expressive anime-inspired full-size splash illustrations for menus/story/profiles; coherent animated **2D sprites** for automatic combat. No mandatory 3D renderer.
- Character-first screen: illustration left/center-left, data right, character selector, distinct tabs.
- **Large character name** with rapid left-to-right **fill/glitch reveal**, NOT typewriter.
- **Stats readable without scrolling** on normal desktop viewports. Condense/collapse lore before shrinking numbers or hiding gameplay data.
- Stats tab: compact, legible comparison; Skills tab: graphic/nodal *if mechanics justify*; Equipment: modular arrangement *only if slots exist*. Prototype slots are NOT evidence of actual game systems.
- Slow, low-opacity moving letters **behind** and sparingly **in front of** a hero illustration to create controlled depth; do not cover face or critical stats.
- Dark base colors plus selected-character accent, but gameplay types Psico/Energía/Defensa/Control still need semantic labels, symbols and contrast, not only accent color.

## Motion and feedback
Character selection uses exactly ONE vertical white right-docked **SELECT** with black lettering. It launches **from right to left**, triggers kinetic diagonal/triangle wipes, exits, and reveals the next hero. It must NOT reappear as a horizontal second arrow. Maintain dynamic accents and brief staggered panel details; avoid visual clutter and flash. Major VFX emphasize important events. See [MOTION_LANGUAGE.md](MOTION_LANGUAGE.md).

## Non-canonical status
Selene/Kuroe/Orion, mock profile data, skill icons, equipment slots and exploratory quotes are **fixtures only**. They are not official lore, characters, skills or historic formulas. Do not wire their stats into the engine.

## Avoid
AI/SaaS dashboards, arbitrary card grids, shiny glass everywhere, excessive particles, distracting motion, fake buttons, hidden battle explanations, non-original artwork and unverified gacha mechanics. Match accessibility in `docs/UI_UX_GUIDELINES.md`.
