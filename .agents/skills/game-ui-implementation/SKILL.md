---
name: game-ui-implementation
description: Use to implement approved Vyrathen frontend components, safely integrate Character Lab React v0.5, or deliver game UI feature slices.
---

# game-ui-implementation

1. Inspect actual repo structure and relevant docs: AGENTS.md, docs/design/VISUAL_DIRECTION_V05.md, docs/design/CHARACTER_LAB_SPEC.md, docs/ARCHITECTURE_AND_QUALITY.md.
2. Extend existing React 19/TS/Vite incrementally. Preserve src/App.tsx, engine, seed, tests, saved game and current routes. Use /character-lab lazy isolated feature for prototype.
3. Namespace CSS, use typed adapters and treat fixtures/art as noncanonical. Avoid global styles that collide with game.
4. Implement single right-fixed vertical SELECT traveling left; name fill/glitch; restrained moving text layers; stat priority; distinct tabs; keyboard/reduced motion.
5. Verify path loading, 1366x768, 1440, 1920, 320 mobile overflow and asset rights.
6. Run npm test, npm run typecheck, npm run build and browser checks when available. Report accurately what did and didn't run.
