# Character Lab v0.5 — integration contract

This is a **noncanonical visual laboratory**, not a new game engine or gameplay release. Preserve existing `src/App.tsx`, `src/engine/*`, seeded combat, tests, `vyrathen-v01` localStorage and documented provenance.

## Design/behavior
- Desktop-first character-first frame: roster, large illustration, contextual info right, tabs.
- Single **SELECT** white vertical fixed on the right; on character change THAT piece flies right→left, disappears into synchronized diagonal wipe and returns only on next idle. No horizontal duplicate.
- Huge name rapid **fill/glitch reveal** (preferred over typewriter).
- All six primary statistics visible without scroll on typical desktop; compact/collapse secondary lore first.
- Distinct compositional states for Base Stats / Skills / Equipment; per-character accent changes.
- Slow moving typographic symbols behind hero and few in foreground to create depth.
- Switch via portraits and left/right; keys 1–3 choose tabs; M ambient toggle; R reduced motion; REPLAY next character.
- Keyboard focus, reduced-motion and aria-live semantics, contrast and critical information without animation.

## Technical isolation
Prefer `/character-lab` lazy-mounted standalone feature in `src/features/character-lab/` with CSS scoped to `#vyr-character-lab`. This is safer than replacing the existing production App or styles. Add `motion` only as needed; all demo art is conceptual. Replace the fixtures via typed adapter to real engine hero data ONLY after gameplay provenance review.

## Acceptance
Original `/` still behaves identically; `/character-lab` renders with no missing art, no style collisions; `npm test`, `npm run typecheck`, `npm run build` succeed; manual 1366×768 and mobile overflow, keyboard and reduced motion verification. Never claim tests passed without running them.
