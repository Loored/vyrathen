# Vyrathen — Motion language v0.5

**Controlled Chaos:** low-intensity ambient motion, energetic interactions, cinematic effects reserved for meaningful moments. Prioritize game feedback and legibility.

## Character switch (approved signature)
1. Idle: ONE vertical right-fixed white **SELECT** arrow, dark type, visible.
2. Player requests another portrait with mouse/keyboard; prevent duplicate conflicting transitions.
3. That SAME SELECT element slides right→left; triangular angular shards follow as a coordinated wipe. It crosses and disappears (NOT a horizontal duplicate).
4. Hero art, color tokens and details swap **under the wipe** in one sequenced state change.
5. Large name appears using left→right **fill with brief restrained glitch/echo**; subtitle, tags and stats stagger subtly; motion stabilizes.
6. Reduced-motion removes wipes/glitch/flash and shows text immediately.

v0.5 study uses ~315ms covered state swap and ~800ms complete sequence. These are **prototyping hypotheses, not measured ZZZ timings**. Maintain one orchestration clock, adaptable for longer names and low-end PCs.

## Layered ambience
Slow oversized lettering, grid/circuit marks and subtle parallax behind protagonist. Minimal transparent lettering in front of the illustration, avoiding face and navigation. Proper depth later requires isolated character layers or masks rather than a single background rectangle. Pausable ambient motion.

## Microfeedback
Stats: stagger readable rows, no blocking transitions. Skills: nodes/icons within historically verified mechanics. Equipment: visually distinct modular display, do not assert four real equipment slots. Purchase/mission: confirmed state-first feedback. Rewards get stronger but infrequent accents. Avoid treating frequent menu interactions as cinematics.

## Engineering
Use Motion for React (`motion/react`) + CSS/SVG for UI, preferably opacity/transform; PixiJS later for sprite-based combat particle canvases; Three.js only for real 3D need. Automatic combat presentation consumes deterministic structured engine events, never controls RNG or outcomes. Reduced-motion, focus and keyboard states are mandatory.
