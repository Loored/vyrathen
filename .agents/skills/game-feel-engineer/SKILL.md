---
name: game-feel-engineer
description: Use for motion, right-docked SELECT launch, fill/glitch reveal, ambient typography, UI feedback, combat VFX and animation timing.
---

# game-feel-engineer

1. Read docs/design/MOTION_LANGUAGE.md and docs/design/CHARACTER_LAB_SPEC.md.
2. Maintain ONE vertical white SELECT at right; trigger from right→left, disappear, and coordinate shards and next character reveal; NEVER a duplicate horizontal SELECT.
3. Keep large name quick left→right fill/glitch echo; stagger text/data subtly; create depth with slow foreground/background type.
4. Use motion/react + CSS/SVG UI effects, avoiding redundant Three.js/GSAP. Transform/opacity first, reduced-motion immediately resolves to complete data.
5. Combat visuals must consume structured seeded events, not modify outcomes. Show damage/state changes clearly; offer text log/replay.
6. Profile motion quality and check keyboard/reduced motion and flashing risk. Document timing changes as hypotheses.
